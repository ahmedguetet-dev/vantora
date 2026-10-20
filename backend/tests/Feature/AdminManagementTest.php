<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    private function staff(string $role = 'admin'): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function order(User $customer, array $attrs = [], int $qty = 2, ?Product $product = null): Order
    {
        $product ??= Product::factory()->create(['stock' => 10]);
        $order = Order::create(array_merge([
            'user_id' => $customer->id,
            'number' => 'ORD-'.uniqid(),
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'payment_method' => 'cod',
            'subtotal_cents' => 1000, 'total_cents' => 1000,
            'shipping_address' => ['city' => 'Sousse'],
            'placed_at' => now(),
        ], $attrs));
        OrderItem::create([
            'order_id' => $order->id, 'product_id' => $product->id, 'name' => $product->name,
            'sku' => $product->sku, 'unit_price_cents' => 500, 'quantity' => $qty, 'line_total_cents' => 500 * $qty,
        ]);

        return $order;
    }

    public function test_admin_endpoints_reject_guests_and_customers(): void
    {
        $paths = ['products', 'categories', 'orders', 'customers'];

        foreach ($paths as $path) {
            $this->getJson("/api/v1/admin/$path")->assertUnauthorized();
        }

        $customer = User::factory()->create(['role' => 'customer']);

        foreach ($paths as $path) {
            $this->actingAs($customer)->getJson("/api/v1/admin/$path")->assertForbidden();
        }
    }

    public function test_product_create_validates_and_records_initial_stock(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->staff('manager'))
            ->postJson('/api/v1/admin/products', ['name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'name', 'sku', 'description', 'price_cents']);

        $payload = [
            'category_id' => $category->id, 'name' => 'Linen Shirt', 'sku' => 'LIN-1',
            'description' => 'Soft linen.', 'price_cents' => 4500, 'stock' => 7,
            'images' => [['url' => 'https://example.com/a.jpg']],
        ];

        $this->actingAs($this->staff())->postJson('/api/v1/admin/products', $payload)
            ->assertCreated()
            ->assertJsonPath('data.slug', 'linen-shirt')
            ->assertJsonCount(1, 'data.images');

        $this->assertDatabaseHas('stock_movements', ['delta' => 7, 'reason' => 'initial_stock']);

        $this->actingAs($this->staff())->postJson('/api/v1/admin/products', $payload)
            ->assertUnprocessable()->assertJsonValidationErrors(['sku']);

        $this->actingAs($this->staff())
            ->postJson('/api/v1/admin/products', array_merge($payload, ['sku' => 'LIN-2', 'images' => [['url' => 'javascript:alert(1)']]]))
            ->assertUnprocessable()->assertJsonValidationErrors(['images.0.url']);
    }

    public function test_product_search_filter_and_safe_deactivation(): void
    {
        $out = Product::factory()->create(['name' => 'Alpha Bag', 'stock' => 0]);
        Product::factory()->create(['name' => 'Beta Hat', 'stock' => 50]);
        $admin = $this->staff();

        $this->actingAs($admin)->getJson('/api/v1/admin/products?q=Alpha')
            ->assertOk()->assertJsonPath('data.total', 1);
        $this->actingAs($admin)->getJson('/api/v1/admin/products?stock=out')
            ->assertOk()->assertJsonPath('data.data.0.id', $out->id);

        $this->actingAs($admin)->patchJson("/api/v1/admin/products/{$out->id}/active", ['is_active' => false])
            ->assertOk()->assertJsonPath('data.is_active', false);
        $this->assertDatabaseHas('products', ['id' => $out->id, 'is_active' => false]);
    }

    public function test_product_update_cannot_change_stock_directly(): void
    {
        $product = Product::factory()->create(['stock' => 5]);

        $this->actingAs($this->staff())
            ->putJson("/api/v1/admin/products/{$product->id}", ['price_cents' => 999, 'stock' => 999])
            ->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertSame(999, $product->fresh()->price_cents);
    }

    public function test_stock_adjustment_is_audited_and_never_negative(): void
    {
        $product = Product::factory()->create(['stock' => 5]);
        $admin = $this->staff();

        $this->actingAs($admin)->postJson("/api/v1/admin/products/{$product->id}/stock", ['delta' => 10, 'reason' => 'restock'])
            ->assertOk()->assertJsonPath('data.stock', 15);
        $this->assertDatabaseHas('stock_movements', ['product_id' => $product->id, 'delta' => 10, 'reason' => 'restock']);

        $this->actingAs($admin)->postJson("/api/v1/admin/products/{$product->id}/stock", ['delta' => -16])
            ->assertUnprocessable()->assertJsonValidationErrors(['delta']);
        $this->assertSame(15, $product->fresh()->stock);
    }

    public function test_category_crud_toggle_and_cycle_protection(): void
    {
        $admin = $this->staff();

        $parentId = $this->actingAs($admin)->postJson('/api/v1/admin/categories', ['name' => 'Home Decor'])
            ->assertCreated()->assertJsonPath('data.slug', 'home-decor')->json('data.id');
        $childId = $this->actingAs($admin)->postJson('/api/v1/admin/categories', ['name' => 'Lamps', 'parent_id' => $parentId])
            ->assertCreated()->json('data.id');

        $this->actingAs($admin)->putJson("/api/v1/admin/categories/$parentId", ['parent_id' => $childId])
            ->assertUnprocessable()->assertJsonValidationErrors(['parent_id']);

        $this->actingAs($admin)->patchJson("/api/v1/admin/categories/$childId/active", ['is_active' => false])
            ->assertOk()->assertJsonPath('data.is_active', false);

        $this->actingAs($admin)->getJson('/api/v1/admin/categories?status=inactive')
            ->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_order_status_transitions_are_enforced(): void
    {
        $order = $this->order(User::factory()->create());
        $admin = $this->staff();

        $this->actingAs($admin)->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'delivered'])
            ->assertUnprocessable()->assertJsonValidationErrors(['status']);

        foreach (['processing', 'shipped', 'delivered'] as $status) {
            $this->actingAs($admin)->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => $status])
                ->assertOk()->assertJsonPath('data.status', $status);
        }

        $fresh = $order->fresh();
        $this->assertSame('paid', $fresh->payment_status->value);
        $this->assertSame(3, $fresh->histories()->count());

        $this->actingAs($admin)->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertUnprocessable();
    }

    public function test_cancelling_an_order_restocks_exactly_once(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        $order = $this->order(User::factory()->create(), [], 3, $product);
        $admin = $this->staff();

        $this->actingAs($admin)->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'cancelled', 'note' => 'Customer request'])
            ->assertOk();
        $this->assertSame(13, $product->fresh()->stock);

        $this->actingAs($admin)->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertUnprocessable();
        $this->assertSame(13, $product->fresh()->stock);
    }

    public function test_order_listing_filters_and_customer_overview(): void
    {
        $alice = User::factory()->create(['name' => 'Alice Zed', 'role' => 'customer']);
        $bob = User::factory()->create(['name' => 'Bob Yan', 'role' => 'customer']);
        $this->order($alice);
        $this->order($bob, ['status' => 'shipped']);
        $admin = $this->staff();

        $this->actingAs($admin)->getJson('/api/v1/admin/orders?status=shipped')
            ->assertOk()->assertJsonPath('data.total', 1);
        $this->actingAs($admin)->getJson('/api/v1/admin/orders?q=Alice')
            ->assertOk()->assertJsonPath('data.total', 1);

        $this->actingAs($admin)->getJson('/api/v1/admin/customers?q=Alice')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.orders_count', 1);
        $this->actingAs($admin)->getJson("/api/v1/admin/customers/{$alice->id}")
            ->assertOk()->assertJsonCount(1, 'data.orders');
        $this->actingAs($admin)->getJson("/api/v1/admin/customers/{$admin->id}")->assertNotFound();
    }

    public function test_dashboard_reflects_database_values(): void
    {
        Product::factory()->create(['stock' => 0]);
        Product::factory()->create(['stock' => 3, 'low_stock_threshold' => 5]);
        Product::factory()->create(['stock' => 40]);
        Product::factory()->create(['stock' => 0, 'is_active' => false]);
        // Each order() below also creates one in-stock product, so 6 products in total.
        $customer = User::factory()->create(['role' => 'customer']);
        $this->order($customer, ['payment_status' => 'paid', 'total_cents' => 5000]);
        $this->order($customer, ['payment_status' => 'paid', 'status' => 'cancelled', 'total_cents' => 9000]);

        $this->actingAs($this->staff())->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.products.total', 6)
            ->assertJsonPath('data.products.low_stock', 1)
            ->assertJsonPath('data.products.out_of_stock', 1)
            ->assertJsonPath('data.orders.revenue_cents', 5000)
            ->assertJsonPath('data.customers.total', 1);
    }
}
