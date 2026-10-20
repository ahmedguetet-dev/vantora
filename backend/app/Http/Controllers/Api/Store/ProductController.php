<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ProductIndexRequest;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductDetailResource;
use App\Models\Product;
use App\Services\Catalog\ProductCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ProductController extends Controller
{
    public function index(ProductIndexRequest $request, ProductCatalog $catalog): AnonymousResourceCollection
    {
        return ProductCardResource::collection($catalog->paginate($request->validated()));
    }

    public function show(string $slug): ProductDetailResource
    {
        $product = Product::query()
            ->active()
            ->where('slug', $slug)
            ->with(['category', 'images'])
            ->firstOrFail();

        return new ProductDetailResource($product);
    }

    public function related(string $slug): AnonymousResourceCollection
    {
        $product = Product::query()->active()->where('slug', $slug)->firstOrFail();

        $related = Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->with(['category:id,name,slug', 'images'])
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return ProductCardResource::collection($related);
    }

    public function facets(ProductCatalog $catalog): JsonResponse
    {
        return response()->json(['data' => $catalog->facets()]);
    }
}