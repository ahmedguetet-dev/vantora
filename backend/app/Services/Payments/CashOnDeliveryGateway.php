<?php

namespace App\Services\Payments;

use App\Contracts\Payments\PaymentGatewayInterface;

class CashOnDeliveryGateway implements PaymentGatewayInterface
{
    public function initiate(array $order): array
    {
        return [
            'status' => 'unpaid',
            'reference' => null,
            'message' => 'Cash on delivery selected. No online payment was processed.',
        ];
    }
}