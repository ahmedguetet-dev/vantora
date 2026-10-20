<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->relationLoaded('images') ? $this->images : collect();

        $discount = $this->compare_at_cents && $this->compare_at_cents > $this->price_cents
            ? (int) round((1 - $this->price_cents / $this->compare_at_cents) * 100)
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => $this->brand,
            'price_cents' => $this->price_cents,
            'compare_at_cents' => $this->compare_at_cents,
            'discount_percent' => $discount,
            'rating_avg' => $this->rating_avg,
            'rating_count' => $this->rating_count,
            'is_featured' => $this->is_featured,
            'image' => $images->get(0)?->url,
            'hover_image' => $images->get(1)?->url,
            'category' => $this->whenLoaded('category', fn () => [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'stock_status' => $this->stockStatus(),
            // Exact stock is only revealed when it is low ("Only 3 left").
            'stock_left' => $this->stock > 0 && $this->isLowStock() ? $this->stock : null,
        ];
    }

    protected function stockStatus(): string
    {
        return match (true) {
            $this->stock <= 0 => 'out_of_stock',
            $this->isLowStock() => 'low_stock',
            default => 'in_stock',
        };
    }
}