<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class OrderController extends Controller
{
    /** Allowed forward transitions. Delivered and cancelled are terminal. */
    private const TRANSITIONS = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function index(Request $request): JsonResponse
    {
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(array_keys(self::TRANSITIONS))],
            'payment_status' => ['nullable', Rule::in(['unpaid', 'paid', 'refunded'])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $orders = Order::query()
            ->with('user:id,name,email')
            ->withCount('items')
            ->when($f['q'] ?? null, function ($q, $t) {
                $t = addcslashes($t, '%_\\');
                $q->where(fn ($w) => $w->where('number', 'like', "%{$t}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$t}%")->orWhere('email', 'like', "%{$t}%")));
            })
            ->when($f['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($f['payment_status'] ?? null, fn ($q, $s) => $q->where('payment_status', $s))
            ->when($f['from'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($f['to'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest('id')
            ->paginate($f['per_page'] ?? 15);

        return response()->json(['data' => $orders]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['user:id,name,email,phone', 'items', 'histories.changedBy:id,name']);

        return response()->json([
            'data' => $order,
            'meta' => ['allowed_transitions' => self::TRANSITIONS[$order->status->value]],
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(self::TRANSITIONS))],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $order = DB::transaction(function () use ($data, $order, $request) {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $from = $locked->status;
            $to = OrderStatus::from($data['status']);

            if (! in_array($to->value, self::TRANSITIONS[$from->value], true)) {
                throw ValidationException::withMessages([
                    'status' => ["An order cannot move from {$from->value} to {$to->value}."],
                ]);
            }

            $updates = ['status' => $to];

            // Cash on delivery: payment is collected on delivery.
            if ($to === OrderStatus::Delivered && $locked->payment_status === PaymentStatus::Unpaid) {
                $updates['payment_status'] = PaymentStatus::Paid;
            }

            if ($to === OrderStatus::Cancelled) {
                $this->restock($locked, $request->user()->id);
            }

            $locked->update($updates);

            OrderStatusHistory::create([
                'order_id' => $locked->id,
                'from_status' => $from->value,
                'to_status' => $to->value,
                'changed_by' => $request->user()->id,
                'note' => $data['note'] ?? null,
            ]);

            return $locked;
        });

        return $this->show($order->fresh());
    }

    private function restock(Order $order, int $userId): void
    {
        foreach ($order->items()->orderBy('product_id')->get() as $item) {
            if (! $item->product_id) {
                continue;
            }

            $product = Product::query()->lockForUpdate()->find($item->product_id);
            if (! $product) {
                continue;
            }

            $product->increment('stock', $item->quantity);

            StockMovement::create([
                'product_id' => $product->id,
                'delta' => $item->quantity,
                'reason' => 'order_cancelled',
                'order_id' => $order->id,
                'created_by' => $userId,
            ]);
        }
    }
}
