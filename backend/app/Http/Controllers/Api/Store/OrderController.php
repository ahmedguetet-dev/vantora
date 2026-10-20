<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Shop\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->latest('id')
            ->paginate(10);

        return response()->json([
            'data' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless(
            $order->user_id === $request->user()->id,
            404
        );

        return response()->json([
            'data' => $order->load('items', 'histories'),
        ]);
    }

    public function store(
        Request $request,
        OrderService $orderService
    ): JsonResponse {
        $data = $request->validate([
            'address_id' => ['required', 'integer', 'exists:addresses,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $order = $orderService->place(
            $request->user(),
            (int) $data['address_id'],
            $data['notes'] ?? null,
        );

        return response()->json([
            'message' => 'Order placed successfully.',
            'data' => $order,
        ], 201);
    }
}
