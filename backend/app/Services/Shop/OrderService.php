<?php

namespace App\Services\Shop;

use App\Contracts\Payments\PaymentGatewayInterface;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class OrderService
{
    public function __construct(
        private readonly PricingService $pricing,
        private readonly PaymentGatewayInterface $paymentGateway,
    ) {
    }

    public function place(
        User $user,
        int $addressId,
        ?string $notes = null,
    ): Order {
        return DB::transaction(function () use ($user, $addressId, $notes) {
            $address = Address::query()
                ->where('user_id', $user->id)
                ->findOrFail($addressId);

            $cart = Cart::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $cart) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            $cartItems = $cart->items()
                ->orderBy('id')
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            $productIds = $cartItems
                ->pluck('product_id')
                ->unique()
                ->sort()
                ->values();

            $products = Product::query()
                ->whereIn('id', $productIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lines = [];
            $subtotalCents = 0;

            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);
                $quantity = (int) $item->quantity;

                if (
                    ! $product ||
                    ! $product->is_active ||
                    $quantity < 1 ||
                    $quantity > (int) config('shop.max_quantity_per_item') ||
                    $product->stock < $quantity
                ) {
                    throw ValidationException::withMessages([
                        'cart' => [
                            'A product in your cart is unavailable or has insufficient stock.',
                        ],
                    ]);
                }

                $unitPrice = (int) $product->price_cents;
                $lineTotal = $unitPrice * $quantity;

                $lines[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price_cents' => $unitPrice,
                    'line_total_cents' => $lineTotal,
                ];

                $subtotalCents += $lineTotal;
            }

            $totals = $this->pricing->totals($subtotalCents);

            $order = Order::query()->create([
                'user_id' => $user->id,
                'number' => 'ORD-'.now()->format('YmdHis').'-'.Str::upper(Str::random(6)),
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Unpaid,
                'payment_method' => 'cod',
                'subtotal_cents' => $totals['subtotal_cents'],
                'shipping_cents' => $totals['shipping_cents'],
                'tax_cents' => $totals['tax_cents'],
                'discount_cents' => $totals['discount_cents'],
                'total_cents' => $totals['total_cents'],
                'shipping_address' => $address->only([
                    'label',
                    'full_name',
                    'line1',
                    'line2',
                    'city',
                    'region',
                    'postal_code',
                    'country',
                    'phone',
                ]),
                'notes' => $notes,
                'placed_at' => now(),
            ]);

            $this->paymentGateway->initiate([
                'number' => $order->number,
                'total_cents' => $order->total_cents,
                'payment_method' => 'cod',
            ]);

            foreach ($lines as $line) {
                $product = $line['product'];
                $quantity = $line['quantity'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price_cents' => $line['unit_price_cents'],
                    'quantity' => $quantity,
                    'line_total_cents' => $line['line_total_cents'],
                ]);

                $product->decrement('stock', $quantity);

                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'delta' => -$quantity,
                    'reason' => 'order_placed',
                    'order_id' => $order->id,
                    'created_by' => $user->id,
                ]);
            }

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => null,
                'to_status' => OrderStatus::Pending->value,
                'changed_by' => $user->id,
                'note' => 'Order placed.',
            ]);

            $cart->items()->delete();

            return $order->load(['items', 'histories']);
        });
    }
}