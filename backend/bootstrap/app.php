<?php

use App\Http\Middleware\EnsureRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Cookie-based SPA authentication (session + CSRF) for the React app.
        $middleware->statefulApi();

        $middleware->alias([
            'role' => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        $json = fn (string $message, int $status) => response()->json(['message' => $message], $status);

        // Validation errors keep Laravel's default {message, errors} shape (422).

        $exceptions->render(function (AuthenticationException $e, Request $request) use ($json) {
            if ($request->is('api/*')) {
                return $json('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
            }
        });

        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) use ($json) {
            if ($request->is('api/*')) {
                return $json('You are not allowed to perform this action.', Response::HTTP_FORBIDDEN);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) use ($json) {
            if ($request->is('api/*')) {
                return $json('The requested resource was not found.', Response::HTTP_NOT_FOUND);
            }
        });

        $exceptions->render(function (Throwable $e, Request $request) use ($json) {
            if (
                $request->is('api/*')
                && ! config('app.debug')
                && ! $e instanceof HttpExceptionInterface
                && ! $e instanceof ValidationException
            ) {
                report($e);

                return $json('Something went wrong on our side.', Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        });
    })->create();