<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_checkout_and_stock_and_cart_are_updated(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->create([
            'user_id' => $user->id,
        ]);

        $product = Product::factory()->create([
            'price_cents' => 5000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $cart = Cart::create([
            'user_id' => $user->id,
        ]);

        $cart->items()->create([
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'address_id' => $address->id,
                'notes' => 'Test checkout',
            ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Order placed successfully.');

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 3,
        ]);

        $this->assertDatabaseMissing('cart_items', [
            'cart_id' => $cart->id,
        ]);

        $order = Order::query()->firstOrFail();

        $this->assertSame(10000, $order->subtotal_cents);
        $this->assertSame('cod', $order->payment_method);
        $this->assertSame(2, $order->items()->firstOrFail()->quantity);
    }

    public function test_checkout_requires_a_valid_address(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'address_id' => 999999,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('address_id');
    }

    public function test_customer_cannot_checkout_using_another_users_address(): void
    {
        $user = User::factory()->create();
        $anotherUser = User::factory()->create();

        $address = Address::factory()->create([
            'user_id' => $anotherUser->id,
        ]);

        $product = Product::factory()->create([
            'stock' => 5,
            'is_active' => true,
        ]);

        $cart = Cart::create([
            'user_id' => $user->id,
        ]);

        $cart->items()->create([
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'address_id' => $address->id,
            ]);

        $response->assertNotFound();

        $this->assertDatabaseCount('orders', 0);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 5,
        ]);
    }

    public function test_checkout_fails_when_stock_is_insufficient(): void
    {
        $user = User::factory()->create();

        $address = Address::factory()->create([
            'user_id' => $user->id,
        ]);

        $product = Product::factory()->create([
            'price_cents' => 5000,
            'stock' => 1,
            'is_active' => true,
        ]);

        $cart = Cart::create([
            'user_id' => $user->id,
        ]);

        $cart->items()->create([
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'address_id' => $address->id,
            ]);

        $response->assertUnprocessable();

        $this->assertDatabaseCount('orders', 0);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 1,
        ]);
    }
    
public function test_guest_cannot_checkout(): void
{
    $response = $this->postJson('/api/v1/checkout', [
        'address_id' => 1,
    ]);

    $response->assertUnauthorized();

    $this->assertDatabaseCount('orders', 0);
}

public function test_checkout_fails_when_cart_is_empty(): void
{
    $user = User::factory()->create();

    $address = Address::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/checkout', [
            'address_id' => $address->id,
        ]);

    $response->assertUnprocessable();

    $this->assertDatabaseCount('orders', 0);
}

public function test_checkout_fails_when_product_is_inactive(): void
{
    $user = User::factory()->create();

    $address = Address::factory()->create([
        'user_id' => $user->id,
    ]);

    $product = Product::factory()->create([
        'price_cents' => 5000,
        'stock' => 5,
        'is_active' => false,
    ]);

    $cart = Cart::create([
        'user_id' => $user->id,
    ]);

    $cart->items()->create([
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/checkout', [
            'address_id' => $address->id,
        ]);

    $response->assertUnprocessable();

    $this->assertDatabaseCount('orders', 0);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'stock' => 5,
    ]);

    $this->assertDatabaseHas('cart_items', [
        'cart_id' => $cart->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);
}

}
