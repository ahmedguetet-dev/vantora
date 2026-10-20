<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

final class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            $database = 'up';
        } catch (Throwable) {
            $database = 'down';
        }

        return response()->json([
            'data' => [
                'status' => $database === 'up' ? 'ok' : 'degraded',
                'app' => config('app.name'),
                'environment' => app()->environment(),
                'database' => $database,
                'time' => now()->toIso8601String(),
            ],
        ], $database === 'up' ? 200 : 503);
    }
}