<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_ping(): void
    {
        $this->getJson('/api/v1/admin/ping')
            ->assertUnauthorized();
    }

    public function test_customer_cannot_access_admin_ping(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $this->actingAs($customer)
            ->getJson('/api/v1/admin/ping')
            ->assertForbidden();
    }

    public function test_admin_can_access_admin_ping(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/ping')
            ->assertOk()
            ->assertJsonPath('data.ok', true);
    }

    public function test_manager_can_access_admin_ping(): void
    {
        $manager = User::factory()->create([
            'role' => 'manager',
        ]);

        $this->actingAs($manager)
            ->getJson('/api/v1/admin/ping')
            ->assertOk()
            ->assertJsonPath('data.ok', true);
    }
}
