<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    private const ORDER_COUNT = 150;
    private const TAX_RATE = 0.08;
    private const FREE_SHIPPING_FROM_CENTS = 10000;
    private const SHIPPING_CENTS = 700;

    public function run(): void
    {
        $customers = User::where('role', UserRole::Customer->value)->with('addresses')->get();
        $products = Product::where('is_active', true)->get();
        $staffId = User::where('role', UserRole::Admin->value)->value('id');

        for ($i = 1; $i <= self::ORDER_COUNT; $i++) {
            $daysAgo = random_int(0, 364);
            $placedAt = now()->subDays($daysAgo)->subMinutes(random_int(0, 1439));

            $customer = $customers->random();
            $address = $customer->addresses->firstWhere('is_default', true) ?? $customer->addresses->first();

            $lines = $products->random(random_int(1, 4))->map(fn (Product $p) => [
                'product' => $p,
                'quantity' => random_int(1, 3),
            ]);

            $subtotal = $lines->sum(fn ($l) => $l['product']->price_cents * $l['quantity']);
            $shipping = $subtotal >= self::FREE_SHIPPING_FROM_CENTS ? 0 : self::SHIPPING_CENTS;
            $tax = (int) round($subtotal * self::TAX_RATE);
            $status = $this->pickStatus($daysAgo);

            $order = Model::unguarded(fn () => Order::create([
                'user_id' => $customer->id,
                'number' => sprintf('VNT-%s-%04d', $placedAt->format('ymd'), $i),
                'status' => $status,
                'payment_status' => $status === OrderStatus::Delivered ? PaymentStatus::Paid : PaymentStatus::Unpaid,
                'payment_method' => 'cod',
                'subtotal_cents' => $subtotal,
                'shipping_cents' => $shipping,
                'tax_cents' => $tax,
                'discount_cents' => 0,
                'total_cents' => $subtotal + $shipping + $tax,
                'shipping_address' => $address?->only([
                    'full_name', 'line1', 'line2', 'city', 'region', 'postal_code', 'country', 'phone',
                ]) ?? [],
                'placed_at' => $placedAt,
                'created_at' => $placedAt,
                'updated_at' => $placedAt,
            ]));

            foreach ($lines as $line) {
                /** @var Product $product */
                $product = $line['product'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price_cents' => $product->price_cents,
                    'quantity' => $line['quantity'],
                    'line_total_cents' => $product->price_cents * $line['quantity'],
                ]);
            }

            $this->writeHistory($order, $status, $placedAt, $staffId);
        }
    }

    private function pickStatus(int $daysAgo): OrderStatus
    {
        $roll = random_int(1, 100);

        if ($daysAgo > 10) {
            return $roll <= 90 ? OrderStatus::Delivered : OrderStatus::Cancelled;
        }

        return match (true) {
            $roll <= 25 => OrderStatus::Pending,
            $roll <= 50 => OrderStatus::Processing,
            $roll <= 75 => OrderStatus::Shipped,
            $roll <= 92 => OrderStatus::Delivered,
            default => OrderStatus::Cancelled,
        };
    }

    private function writeHistory(Order $order, OrderStatus $final, $placedAt, ?int $staffId): void
    {
        $path = match ($final) {
            OrderStatus::Delivered => [OrderStatus::Pending, OrderStatus::Processing, OrderStatus::Shipped, OrderStatus::Delivered],
            OrderStatus::Shipped => [OrderStatus::Pending, OrderStatus::Processing, OrderStatus::Shipped],
            OrderStatus::Processing => [OrderStatus::Pending, OrderStatus::Processing],
            OrderStatus::Cancelled => [OrderStatus::Pending, OrderStatus::Cancelled],
            OrderStatus::Pending => [OrderStatus::Pending],
        };

        $from = null;
        $at = $placedAt->copy();

        foreach ($path as $step) {
            Model::unguarded(fn () => OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $from?->value,
                'to_status' => $step->value,
                'changed_by' => $step === OrderStatus::Pending ? null : $staffId,
                'created_at' => $at,
                'updated_at' => $at,
            ]));

            $from = $step;
            $at = $at->copy()->addHours(random_int(4, 36));
        }
    }
}