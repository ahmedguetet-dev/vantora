<?php

namespace App\Services\Catalog;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-side catalog logic: filtering, searching, sorting and facets.
 * Keeps controllers thin and the query rules in one testable place.
 */
final class ProductCatalog
{
    public const SORTS = ['newest', 'popular', 'rating', 'price_asc', 'price_desc'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->query($filters)
            ->with(['category:id,name,slug', 'images'])
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString();
    }

    public function query(array $filters): Builder
    {
        $query = Product::query()
            ->active()
            ->whereHas('category', fn (Builder $c) => $c->where('is_active', true));

        $query->when($filters['search'] ?? null, function (Builder $q, string $term) {
            $like = '%'.addcslashes($term, '%_\\').'%';

            $q->where(fn (Builder $w) => $w
                ->where('name', 'like', $like)
                ->orWhere('brand', 'like', $like)
                ->orWhere('sku', 'like', $like)
                ->orWhere('description', 'like', $like));
        });

        $query->when($filters['category'] ?? null, fn (Builder $q, string $slug) => $q
            ->whereHas('category', fn (Builder $c) => $c->where('slug', $slug)));

        $query->when($filters['brand'] ?? null, fn (Builder $q, array $brands) => $q->whereIn('brand', $brands));

        if (isset($filters['min_price'])) {
            $query->where('price_cents', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price_cents', '<=', $filters['max_price']);
        }

        if (! empty($filters['in_stock'])) {
            $query->inStock();
        }

        if (! empty($filters['on_sale'])) {
            $query->whereNotNull('compare_at_cents');
        }

        return $this->sort($query, $filters['sort'] ?? 'newest');
    }

    public function facets(): array
    {
        $base = Product::query()->active();

        $brands = (clone $base)
            ->whereNotNull('brand')
            ->selectRaw('brand, count(*) as total')
            ->groupBy('brand')
            ->orderBy('brand')
            ->get()
            ->map(fn ($row) => ['name' => $row->brand, 'count' => (int) $row->total])
            ->all();

        return [
            'brands' => $brands,
            'price' => [
                'min' => (int) (clone $base)->min('price_cents'),
                'max' => (int) (clone $base)->max('price_cents'),
            ],
        ];
    }

    private function sort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'price_asc' => $query->orderBy('price_cents')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price_cents')->orderByDesc('id'),
            'popular' => $query->orderByDesc('rating_count')->orderByDesc('id'),
            'rating' => $query->orderByDesc('rating_avg')->orderByDesc('rating_count')->orderByDesc('id'),
            default => $query->orderByDesc('id'),
        };
    }
}