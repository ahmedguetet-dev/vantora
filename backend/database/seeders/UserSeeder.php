<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // All demo accounts use the password: Password123!
        User::factory()->admin()->create(['name' => 'Amira Ben Salah', 'email' => 'admin@vantora.test']);
        User::factory()->manager()->create(['name' => 'Karim Trabelsi', 'email' => 'manager@vantora.test']);
        User::factory()->create(['name' => 'Demo Customer', 'email' => 'customer@vantora.test']);
        User::factory()->count(24)->create();

        User::where('role', UserRole::Customer->value)->get()->each(function (User $user) {
            Address::factory()->for($user)->create([
                'label' => 'Home',
                'full_name' => $user->name,
                'is_default' => true,
            ]);

            if (random_int(0, 2) === 0) {
                Address::factory()->for($user)->create(['label' => 'Work', 'full_name' => $user->name]);
            }
        });
    }
}