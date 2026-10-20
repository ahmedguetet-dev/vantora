<?php

namespace App\Contracts\Payments;

interface PaymentGatewayInterface
{
    /**
     * Prepare a payment attempt without processing a real transaction.
     *
     * @param array<string, mixed> $order
     * @return array{
     *     status: string,
     *     reference: string|null,
     *     message: string
     * }
     */
    public function initiate(array $order): array;
}