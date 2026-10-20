<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = ucwords(fake()->unique()->words(3, true));

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('####'),
            'sku' => 'TST-'.fake()->unique()->numerify('######'),
            'description' => fake()->paragraph(),
            'price_cents' => fake()->numberBetween(1500, 60000),
            'stock' => fake()->numberBetween(0, 100),
            'low_stock_threshold' => 5,
            'brand' => fake()->company(),
            'is_active' => true,
            'is_featured' => false,
        ];
    }
}