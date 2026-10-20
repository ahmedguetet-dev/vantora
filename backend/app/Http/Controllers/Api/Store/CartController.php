<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\CartItemRequest;
use App\Http\Requests\Store\CartMergeRequest;
use App\Http\Requests\Store\CartPreviewRequest;
use App\Http\Requests\Store\UpdateCartItemRequest;
use App\Models\Product;
use App\Services\Shop\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CartController extends Controller
{
    public function __construct(private readonly CartService $cart)
    {
    }

    public function show(Request $request): JsonResponse
    {
        return $this->respond($this->cart->summaryForUser($request->user()));
    }

    /** Public: prices a guest cart held in the browser. */
    public function preview(CartPreviewRequest $request): JsonResponse
    {
        return $this->respond($this->cart->summaryForItems($request->parsedItems()));
    }

    public function add(CartItemRequest $request): JsonResponse
    {
        $product = Product::query()->findOrFail($request->validated('product_id'));
        $result = $this->cart->add($request->user(), $product, (int) ($request->validated('quantity') ?? 1));

        return $this->respond($this->cart->summaryForUser($request->user()), $result, 'Added to cart.');
    }

    public function update(UpdateCartItemRequest $request, Product $product): JsonResponse
    {
        $result = $this->cart->setQuantity($request->user(), $product, (int) $request->validated('quantity'));

        return $this->respond($this->cart->summaryForUser($request->user()), $result);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->cart->remove($request->user(), $product);

        return $this->respond($this->cart->summaryForUser($request->user()), null, 'Removed from cart.');
    }

    public function clear(Request $request): JsonResponse
    {
        $this->cart->clear($request->user());

        return $this->respond($this->cart->summaryForUser($request->user()), null, 'Cart cleared.');
    }

    public function merge(CartMergeRequest $request): JsonResponse
    {
        $this->cart->merge($request->user(), $request->validated('items'));

        return $this->respond($this->cart->summaryForUser($request->user()));
    }

    private function respond(array $summary, ?array $result = null, ?string $message = null): JsonResponse
    {
        $payload = ['data' => $summary];

        if ($message) {
            $payload['message'] = $message;
        }

        if ($result && $result['limited']) {
            $payload['notice'] = "Quantity limited to {$result['max']} for this item.";
        }

        return response()->json($payload);
    }
}