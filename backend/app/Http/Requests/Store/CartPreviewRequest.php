<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class CartPreviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Format: "12:2,5:1" (product_id:quantity, comma separated)
        return [
            'items' => ['required', 'string', 'max:1000', 'regex:/^\d+:\d+(,\d+:\d+)*$/'],
        ];
    }

    /** @return array<int, array{product_id:int, quantity:int}> */
    public function parsedItems(): array
    {
        return collect(explode(',', $this->validated('items')))
            ->take(50)
            ->map(function (string $pair) {
                [$id, $quantity] = explode(':', $pair);

                return [
                    'product_id' => (int) $id,
                    'quantity' => max(1, min(99, (int) $quantity)),
                ];
            })
            ->all();
    }
}