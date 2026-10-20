<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

final class HomeController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $list = fn (Builder $query, int $limit = 8) => ProductCardResource::collection(
            $query->with(['category:id,name,slug', 'images'])->limit($limit)->get()
        )->resolve();

        $categories = Category::query()
            ->active()
            ->withCount(['products' => fn ($q) => $q->active()])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => [
                'featured' => $list(Product::query()->active()->featured()->inStock()->orderByDesc('rating_avg')),
                'new_arrivals' => $list(Product::query()->active()->orderByDesc('id')),
                'deals' => $list(Product::query()->active()->whereNotNull('compare_at_cents')->orderByDesc('rating_avg'), 4),
                'categories' => CategoryResource::collection($categories)->resolve(),
            ],
        ]);
    }
}