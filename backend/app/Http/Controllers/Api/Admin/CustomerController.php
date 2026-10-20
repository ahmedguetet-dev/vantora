<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $customers = User::query()
            ->where('role', 'customer')
            ->select(['id', 'name', 'email', 'phone', 'created_at'])
            ->withCount('orders')
            ->withSum(['orders as total_spent_cents' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'total_cents')
            ->withMax('orders as last_order_at', 'created_at')
            ->when($f['q'] ?? null, function ($q, $t) {
                $t = addcslashes($t, '%_\\');
                $q->where(fn ($w) => $w->where('name', 'like', "%{$t}%")->orWhere('email', 'like', "%{$t}%"));
            })
            ->latest('id')
            ->paginate($f['per_page'] ?? 15);

        return response()->json(['data' => $customers]);
    }

    public function show(User $customer): JsonResponse
    {
        abort_unless($customer->role?->value === 'customer', 404);

        $customer->loadCount('orders')
            ->loadSum(['orders as total_spent_cents' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'total_cents');

        return response()->json([
            'data' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'created_at' => $customer->created_at,
                'orders_count' => $customer->orders_count,
                'total_spent_cents' => (int) $customer->total_spent_cents,
                'orders' => $customer->orders()->latest('id')->limit(20)
                    ->get(['id', 'number', 'status', 'payment_status', 'total_cents', 'created_at']),
            ],
        ]);
    }
}
