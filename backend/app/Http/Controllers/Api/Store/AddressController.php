<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

final class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $addresses]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:50'],
            'full_name' => ['required', 'string', 'max:150'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'size:2'],
            'phone' => ['required', 'string', 'max:30'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $address = DB::transaction(function () use ($request, $data) {
            $user = $request->user();
            $makeDefault = (bool) ($data['is_default'] ?? false)
                || ! $user->addresses()->exists();

            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            $data['is_default'] = $makeDefault;

            return $user->addresses()->create($data);
        });

        return response()->json([
            'message' => 'Address created.',
            'data' => $address,
        ], 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        abort_unless(
            $address->user_id === $request->user()->id,
            404
        );

        $data = $request->validate([
            'label' => ['sometimes', 'required', 'string', 'max:50'],
            'full_name' => ['sometimes', 'required', 'string', 'max:150'],
            'line1' => ['sometimes', 'required', 'string', 'max:255'],
            'line2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'required', 'string', 'max:100'],
            'region' => ['sometimes', 'nullable', 'string', 'max:100'],
            'postal_code' => ['sometimes', 'nullable', 'string', 'max:20'],
            'country' => ['sometimes', 'required', 'string', 'size:2'],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $address = DB::transaction(function () use ($request, $address, $data) {
            $user = $request->user();

            if (($data['is_default'] ?? false) === true) {
                $user->addresses()->update(['is_default' => false]);
            }

            $address->fill($data);
            $address->save();

            return $address->refresh();
        });

        return response()->json([
            'message' => 'Address updated.',
            'data' => $address,
        ]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        abort_unless(
            $address->user_id === $request->user()->id,
            404
        );

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }

    public function makeDefault(Request $request, Address $address): JsonResponse
    {
        abort_unless(
            $address->user_id === $request->user()->id,
            404
        );

        DB::transaction(function () use ($request, $address) {
            $request->user()->addresses()->update(['is_default' => false]);

            $address->update(['is_default' => true]);
        });

        return response()->json([
            'message' => 'Default address updated.',
            'data' => $address->refresh(),
        ]);
    }
}
