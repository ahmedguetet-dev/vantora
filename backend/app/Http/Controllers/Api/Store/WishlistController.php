<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\WishlistRequest;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class WishlistController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = $request->user()
            ->wishlist()
            ->active()
            ->with(['category:id,name,slug', 'images'])
            ->orderByPivot('created_at', 'desc')
            ->get();

        return ProductCardResource::collection($products);
    }

    public function store(WishlistRequest $request): JsonResponse
    {
        // Idempotent: adding the same product twice is a no-op.
        $request->user()->wishlist()->syncWithoutDetaching([$request->validated('product_id')]);

        return response()->json([
            'message' => 'Added to wishlist.',
            'data' => ['product_id' => (int) $request->validated('product_id')],
        ], 201);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $request->user()->wishlist()->detach($product->id);

        return response()->json(['message' => 'Removed from wishlist.']);
    }
}