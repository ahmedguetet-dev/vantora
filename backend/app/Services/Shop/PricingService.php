<?php

namespace App\Services\Shop;

/**
 * Single source of truth for money maths (all values are integer cents).
 * Used by the cart now and by checkout/orders later.
 */
final class PricingService
{
    public function totals(int $subtotalCents, int $discountCents = 0): array
    {
        $threshold = (int) config('shop.free_shipping_threshold_cents');
        $taxable = max(0, $subtotalCents - $discountCents);

        $shipping = ($subtotalCents === 0 || $subtotalCents >= $threshold)
            ? 0
            : (int) config('shop.shipping_cents');

        $tax = (int) round($taxable * (float) config('shop.tax_rate'));

        return [
            'subtotal_cents' => $subtotalCents,
            'shipping_cents' => $shipping,
            'tax_cents' => $tax,
            'discount_cents' => $discountCents,
            'total_cents' => $taxable + $shipping + $tax,
            'free_shipping_remaining_cents' => ($subtotalCents > 0 && $subtotalCents < $threshold)
                ? $threshold - $subtotalCents
                : 0,
        ];
    }
}