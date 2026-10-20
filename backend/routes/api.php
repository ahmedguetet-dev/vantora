<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Store\AddressController;
use App\Http\Controllers\Api\Store\CartController;
use App\Http\Controllers\Api\Store\CategoryController;
use App\Http\Controllers\Api\Store\HomeController;
use App\Http\Controllers\Api\Store\OrderController;
use App\Http\Controllers\Api\Store\ProductController;
use App\Http\Controllers\Api\Store\WishlistController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health
    Route::get('health', HealthController::class);

    // Authentication
    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:10,1');

    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:login');

    // Public storefront
    Route::middleware('throttle:120,1')->group(function () {
        Route::get('home', HomeController::class);
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('catalog/facets', [ProductController::class, 'facets']);
        Route::get('products', [ProductController::class, 'index']);
        Route::get('products/{slug}', [ProductController::class, 'show']);
        Route::get('products/{slug}/related', [ProductController::class, 'related']);

        // Guest cart preview
        Route::get('cart/preview', [CartController::class, 'preview']);
    });

    // Authenticated customer
    Route::middleware('auth:sanctum')->group(function () {
        // Profile
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::put('me', [AuthController::class, 'update']);
        Route::put('me/password', [AuthController::class, 'updatePassword']);

        // Cart
        Route::get('cart', [CartController::class, 'show']);
        Route::delete('cart', [CartController::class, 'clear']);
        Route::post('cart/items', [CartController::class, 'add']);
        Route::put('cart/items/{product}', [CartController::class, 'update']);
        Route::delete('cart/items/{product}', [CartController::class, 'destroy']);
        Route::post('cart/merge', [CartController::class, 'merge']);

        // Wishlist
        Route::get('wishlist', [WishlistController::class, 'index']);
        Route::post('wishlist', [WishlistController::class, 'store']);
        Route::delete('wishlist/{product}', [WishlistController::class, 'destroy']);

        // Addresses
        Route::get('addresses', [AddressController::class, 'index']);
        Route::post('addresses', [AddressController::class, 'store']);
        Route::put('addresses/{address}', [AddressController::class, 'update']);
        Route::delete('addresses/{address}', [AddressController::class, 'destroy']);
        Route::patch('addresses/{address}/default', [AddressController::class, 'makeDefault']);

        // Checkout and orders
        Route::post('checkout', [OrderController::class, 'store']);
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
    });

    // Admin (staff only)
    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'role:admin,manager'])
        ->group(function () {
            Route::get('ping', fn () => response()->json([
                'data' => ['ok' => true],
            ]));

            Route::get('dashboard', DashboardController::class);

            Route::get('products', [AdminProductController::class, 'index']);
            Route::post('products', [AdminProductController::class, 'store']);
            Route::get('products/{product}', [AdminProductController::class, 'show']);
            Route::put('products/{product}', [AdminProductController::class, 'update']);
            Route::patch('products/{product}/active', [AdminProductController::class, 'setActive']);
            Route::post('products/{product}/stock', [AdminProductController::class, 'adjustStock']);

            Route::get('categories', [AdminCategoryController::class, 'index']);
            Route::post('categories', [AdminCategoryController::class, 'store']);
            Route::put('categories/{category}', [AdminCategoryController::class, 'update']);
            Route::patch('categories/{category}/active', [AdminCategoryController::class, 'setActive']);

            Route::get('orders', [AdminOrderController::class, 'index']);
            Route::get('orders/{order}', [AdminOrderController::class, 'show']);
            Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

            Route::get('customers', [AdminCustomerController::class, 'index']);
            Route::get('customers/{customer}', [AdminCustomerController::class, 'show']);
        });
});
