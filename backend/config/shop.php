
<?php

return [
    'currency' => env('SHOP_CURRENCY', 'TND'),

    // Pricing values use the existing API convention:
    // 100 internal units = 1 displayed TND.
    'tax_rate' => (float) env('SHOP_TAX_RATE', 0.08),

    'shipping_cents' => (int) env('SHOP_SHIPPING_CENTS', 700),

    'free_shipping_threshold_cents' => (int) env(
        'SHOP_FREE_SHIPPING_FROM_CENTS',
        10000
    ),

    'max_quantity_per_item' => (int) env('SHOP_MAX_QTY', 10),
];
