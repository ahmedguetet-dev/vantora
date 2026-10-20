<?php

namespace App\Services\Shop;

use App\Http\Resources\ProductCardResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CartService
{
    public function __construct(private readonly PricingService $pricing)
    {
    }

    public function forUser(User $user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }

    /** Highest quantity a customer may hold of this product right now. */
    public function maxQuantity(Product $product): int
    {
        if (! $product->is_active) {
            return 0;
        }

        return max(0, min((int) config('shop.max_quantity_per_item'), $product->stock));
    }

    /** @return array{quantity:int, limited:bool, max:int} */
    public function add(User $user, Product $product, int $quantity): array
    {
        return DB::transaction(function () use ($user, $product, $quantity) {
            $product->refresh();
            $max = $this->guardAvailable($product);

            $cart = $this->forUser($user);
            $item = $cart->items()->where('product_id', $product->id)->lockForUpdate()->first();

            $wanted = ($item?->quantity ?? 0) + $quantity;
            $final = min($wanted, $max);

            $cart->items()->updateOrCreate(['product_id' => $product->id], ['quantity' => $final]);

            return ['quantity' => $final, 'limited' => $wanted > $max, 'max' => $max];
        });
    }

    /** @return array{quantity:int, limited:bool, max:int} */
    public function setQuantity(User $user, Product $product, int $quantity): array
    {
        if ($quantity <= 0) {
            $this->remove($user, $product);

            return ['quantity' => 0, 'limited' => false, 'max' => $this->maxQuantity($product)];
        }

        return DB::transaction(function () use ($user, $product, $quantity) {
            $product->refresh();
            $max = $this->guardAvailable($product);
            $final = min($quantity, $max);

            $this->forUser($user)->items()->updateOrCreate(['product_id' => $product->id], ['quantity' => $final]);

            return ['quantity' => $final, 'limited' => $quantity > $max, 'max' => $max];
        });
    }

    public function remove(User $user, Product $product): void
    {
        $this->forUser($user)->items()->where('product_id', $product->id)->delete();
    }

    public function clear(User $user): void
    {
        $this->forUser($user)->items()->delete();
    }

    /** Merges a guest cart (from the browser) into the user's server cart. */
    public function merge(User $user, array $items): void
    {
        $quantities = $this->groupQuantities($items);
        $products = Product::query()->whereIn('id', $quantities->keys())->get()->keyBy('id');

        DB::transaction(function () use ($user, $quantities, $products) {
            $cart = $this->forUser($user);

            foreach ($quantities as $productId => $quantity) {
                $product = $products->get($productId);
                $max = $product ? $this->maxQuantity($product) : 0;

                if ($max < 1) {
                    continue;
                }

                $item = $cart->items()->where('product_id', $productId)->lockForUpdate()->first();
                $final = min(($item?->quantity ?? 0) + $quantity, $max);

                $cart->items()->updateOrCreate(['product_id' => $productId], ['quantity' => $final]);
            }
        });
    }

    public function summaryForUser(User $user): array
    {
        $items = $this->forUser($user)
            ->items()
            ->with(['product.images', 'product.category:id,name,slug'])
            ->orderBy('id')
            ->get();

        return $this->summarize($items->map(fn (CartItem $item) => [
            'product' => $item->product,
            'quantity' => $item->quantity,
        ]));
    }

    /** Prices a guest cart without storing anything. Unknown/inactive products are dropped. */
    public function summaryForItems(array $items): array
    {
        $quantities = $this->groupQuantities($items);

        $products = Product::query()
            ->active()
            ->whereIn('id', $quantities->keys())
            ->with(['images', 'category:id,name,slug'])
            ->get()
            ->keyBy('id');

        $lines = $quantities
            ->map(fn (int $quantity, $id) => ['product' => $products->get($id), 'quantity' => $quantity])
            ->filter(fn (array $line) => $line['product'] !== null)
            ->values();

        return $this->summarize($lines);
    }

    /** @param Collection<int, array{product: Product, quantity: int}> $lines */
    private function summarize(Collection $lines): array
    {
        $rows = $lines->map(function (array $line) {
            /** @var Product $product */
            $product = $line['product'];
            $requested = (int) $line['quantity'];
            $max = $this->maxQuantity($product);
            $quantity = $max > 0 ? min($requested, $max) : 0;

            return [
                'product_id' => $product->id,
                'quantity' => $max > 0 ? $quantity : $requested,
                'max_quantity' => $max,
                'unit_price_cents' => $product->price_cents,
                'line_total_cents' => $product->price_cents * $quantity,
                'issue' => $max < 1 ? 'unavailable' : ($requested > $max ? 'limited' : null),
                'product' => ProductCardResource::make($product)->resolve(),
            ];
        })->values();

        $subtotal = (int) $rows->sum('line_total_cents');
        $itemCount = (int) $rows->where('issue', '!==', 'unavailable')->sum('quantity');

        return [
            'items' => $rows->all(),
            'totals' => array_merge(['item_count' => $itemCount], $this->pricing->totals($subtotal)),
        ];
    }

    /** @return Collection<int, int> product_id => total quantity */
    private function groupQuantities(array $items): Collection
    {
        return collect($items)
            ->groupBy('product_id')
            ->map(fn (Collection $rows) => (int) $rows->sum('quantity'));
    }

    private function guardAvailable(Product $product): int
    {
        $max = $this->maxQuantity($product);

        if ($max < 1) {
            throw ValidationException::withMessages([
                'product_id' => ['This product is currently unavailable.'],
            ]);
        }

        return $max;
    }
}