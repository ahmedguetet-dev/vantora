<?php

namespace Tests\Feature\Feature;

use App\Services\Shop\PricingService;
use Tests\TestCase;

class PricingServiceTest extends TestCase
{
    public function test_empty_subtotal_has_no_shipping_or_tax(): void
    {
        $totals = app(PricingService::class)->totals(0);

        $this->assertSame(0, $totals['subtotal_cents']);
        $this->assertSame(0, $totals['shipping_cents']);
        $this->assertSame(0, $totals['tax_cents']);
        $this->assertSame(0, $totals['total_cents']);
        $this->assertSame(0, $totals['free_shipping_remaining_cents']);
    }

    public function test_subtotal_below_free_shipping_threshold_pays_shipping(): void
    {
        $totals = app(PricingService::class)->totals(5000);

        $this->assertSame(5000, $totals['subtotal_cents']);
        $this->assertSame(700, $totals['shipping_cents']);
        $this->assertSame(400, $totals['tax_cents']);
        $this->assertSame(6100, $totals['total_cents']);
        $this->assertSame(5000, $totals['free_shipping_remaining_cents']);
    }

    public function test_subtotal_at_free_shipping_threshold_has_free_shipping(): void
    {
        $totals = app(PricingService::class)->totals(10000);

        $this->assertSame(0, $totals['shipping_cents']);
        $this->assertSame(800, $totals['tax_cents']);
        $this->assertSame(10800, $totals['total_cents']);
        $this->assertSame(0, $totals['free_shipping_remaining_cents']);
    }

    public function test_discount_is_subtracted_before_tax_and_total(): void
    {
        $totals = app(PricingService::class)->totals(10000, 2000);

        $this->assertSame(2000, $totals['discount_cents']);
        $this->assertSame(640, $totals['tax_cents']);
        $this->assertSame(8640, $totals['total_cents']);
    }
}
