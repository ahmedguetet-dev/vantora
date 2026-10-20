<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/** @mixin \App\Models\Product */
class ProductDetailResource extends ProductCardResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'description' => $this->description,
            'sku' => $this->sku,
            'images' => $this->images->map(fn ($image) => [
                'url' => $image->url,
                'alt' => $image->alt,
            ])->values()->all(),
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
        ]);
    }
}