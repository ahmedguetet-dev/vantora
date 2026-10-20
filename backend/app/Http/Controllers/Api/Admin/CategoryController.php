<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $categories = Category::query()
            ->with('parent:id,name')
            ->withCount('products')
            ->when($filters['q'] ?? null, fn ($q, $t) => $q->where('name', 'like', '%'.addcslashes($t, '%_\\').'%'))
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('is_active', $s === 'active'))
            ->orderBy('sort_order')->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['slug'] = $this->uniqueSlug($data['name']);

        return response()->json(['data' => Category::create($data)->loadCount('products')], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate($this->rules($category));

        if (array_key_exists('parent_id', $data) && $data['parent_id'] !== null) {
            $this->assertNoCycle($category, (int) $data['parent_id']);
        }

        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $category->id);
        }

        $category->update($data);

        return response()->json(['data' => $category->fresh()->loadCount('products')]);
    }

    public function setActive(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate(['is_active' => ['required', 'boolean']]);
        $category->update(['is_active' => $data['is_active']]);

        return response()->json(['data' => $category->fresh()->loadCount('products')]);
    }

    private function rules(?Category $category = null): array
    {
        $req = $category ? 'sometimes' : 'required';

        return [
            'name' => [$req, 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'string', 'max:2048', 'regex:#^(https?://|/)#i'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    private function assertNoCycle(Category $category, int $parentId): void
    {
        $cursor = $parentId;
        $guard = 0;

        while ($cursor !== null && $guard++ < 50) {
            if ($cursor === $category->id) {
                throw ValidationException::withMessages([
                    'parent_id' => ['A category cannot be its own parent or descendant.'],
                ]);
            }
            $cursor = Category::whereKey($cursor)->value('parent_id');
        }
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $i = 2;

        while (Category::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
