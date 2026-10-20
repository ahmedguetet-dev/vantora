<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'products' => [
                    'total' => Product::count(),
                    'active' => Product::where('is_active', true)->count(),
                    'low_stock' => Product::where('is_active', true)
                        ->where('stock', '>', 0)
                        ->whereColumn('stock', '<=', 'low_stock_threshold')
                        ->count(),
                    'out_of_stock' => Product::where('is_active', true)
                        ->where('stock', '<=', 0)
                        ->count(),
                ],
                'categories' => [
                    'total' => Category::count(),
                    'active' => Category::where('is_active', true)->count(),
                ],
                'customers' => [
                    'total' => User::where('role', 'customer')->count(),
                ],
                'orders' => [
                    'total' => Order::count(),
                    'today' => Order::whereDate('created_at', today())->count(),
                    'pending' => Order::where('status', 'pending')->count(),
                    'revenue_cents' => (int) Order::where('payment_status', 'paid')
                        ->where('status', '!=', 'cancelled')
                        ->sum('total_cents'),
                ],
            ],
        ]);
    }
}