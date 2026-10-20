<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'stock' => ['nullable', Rule::in(['in', 'low', 'out'])],
            'sort' => ['nullable', Rule::in(['newest', 'name', 'price', 'stock'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $query = Product::query()->with(['category:id,name', 'images'])
            ->when($filters['q'] ?? null, function ($q, $term) {
                $term = addcslashes($term, '%_\\');
                $q->where(fn ($w) => $w->where('name', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%")
                    ->orWhere('brand', 'like', "%{$term}%"));
            })
            ->when($filters['category_id'] ?? null, fn ($q, $id) => $q->where('category_id', $id))
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('is_active', $s === 'active'))
            ->when($filters['stock'] ?? null, function ($q, $s) {
                match ($s) {
                    'out' => $q->where('stock', '<=', 0),
                    'low' => $q->where('stock', '>', 0)->whereColumn('stock', '<=', 'low_stock_threshold'),
                    'in' => $q->where('stock', '>', 0),
                };
            });

        $column = match ($filters['sort'] ?? 'newest') {
            'name' => 'name',
            'price' => 'price_cents',
            'stock' => 'stock',
            default => 'id',
        };

        $products = $query
            ->orderBy($column, $filters['direction'] ?? ($column === 'id' ? 'desc' : 'asc'))
            ->paginate($filters['per_page'] ?? 15);

        return response()->json(['data' => $products]);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => $product->load(['category:id,name', 'images'])]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        $product = DB::transaction(function () use ($data, $request) {
            $images = $data['images'] ?? [];
            unset($data['images']);

            $data['slug'] = $this->uniqueSlug($data['name']);
            $product = Product::create($data);
            $this->syncImages($product, $images);

            if ($product->stock > 0) {
                StockMovement::create([
                    'product_id' => $product->id,
                    'delta' => $product->stock,
                    'reason' => 'initial_stock',
                    'created_by' => $request->user()->id,
                ]);
            }

            return $product;
        });

        return response()->json(['data' => $product->load(['category:id,name', 'images'])], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        // Stock is changed only through the audited stock endpoint.
        $data = $request->validate($this->rules($product, false));

        DB::transaction(function () use ($data, $product) {
            $images = $data['images'] ?? null;
            unset($data['images']);

            if (isset($data['name']) && $data['name'] !== $product->name) {
                $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
            }

            $product->update($data);

            if ($images !== null) {
                $this->syncImages($product, $images);
            }
        });

        return response()->json(['data' => $product->fresh()->load(['category:id,name', 'images'])]);
    }

    public function setActive(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['is_active' => ['required', 'boolean']]);
        $product->update(['is_active' => $data['is_active']]);

        return response()->json(['data' => $product->fresh()]);
    }

    public function adjustStock(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'delta' => ['required', 'integer', 'not_in:0', 'between:-100000,100000'],
            'reason' => ['nullable', Rule::in(['restock', 'correction', 'damaged', 'returned'])],
        ]);

        $product = DB::transaction(function () use ($data, $product, $request) {
            $locked = Product::query()->lockForUpdate()->findOrFail($product->id);

            if ($locked->stock + $data['delta'] < 0) {
                throw ValidationException::withMessages([
                    'delta' => ['Stock cannot go below zero.'],
                ]);
            }

            $locked->increment('stock', $data['delta']);

            StockMovement::create([
                'product_id' => $locked->id,
                'delta' => $data['delta'],
                'reason' => $data['reason'] ?? 'correction',
                'created_by' => $request->user()->id,
            ]);

            return $locked->fresh();
        });

        return response()->json(['data' => $product]);
    }

    private function rules(?Product $product = null, bool $creating = true): array
    {
        $req = $product ? 'sometimes' : 'required';

        $rules = [
            'category_id' => [$req, 'integer', 'exists:categories,id'],
            'name' => [$req, 'string', 'max:255'],
            'sku' => [$req, 'string', 'max:64', Rule::unique('products', 'sku')->ignore($product?->id)],
            'description' => [$req, 'string', 'max:10000'],
            'price_cents' => [$req, 'integer', 'min:0', 'max:100000000'],
            'compare_at_cents' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'brand' => ['nullable', 'string', 'max:120'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'images' => ['sometimes', 'array', 'max:8'],
            'images.*.url' => ['required', 'string', 'max:2048', 'regex:#^(https?://|/)#i'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
        ];

        if ($creating && ! $product) {
            $rules['stock'] = ['sometimes', 'integer', 'min:0', 'max:1000000'];
        }

        return $rules;
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $i = 2;

        while (Product::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach (array_values($images) as $i => $image) {
            $product->images()->create([
                'url' => $image['url'],
                'alt' => $image['alt'] ?? $product->name,
                'sort_order' => $i,
            ]);
        }
    }
}
