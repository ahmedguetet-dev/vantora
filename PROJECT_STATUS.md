# VANTORA — Project Status

## Done (milestone 1: admin management)
- Backend, all behind `auth:sanctum` + `role:admin,manager`, server-side validated:
  - Products: list/search/filter (category, status, stock level)/sort/paginate, create, update, show,
    activate/deactivate (no hard delete), audited stock adjustment (never below zero).
  - Categories: list/filter, create, update, activate/deactivate, parent-cycle protection.
  - Orders: list/filter (status, payment, date range, number/customer), detail, status update with enforced
    transitions (pending→processing→shipped→delivered; cancel from pending/processing). Cancelling restocks
    once, atomically. Delivery marks COD orders paid. Every change is written to order history.
  - Customers: list/search with order count and total spent, detail with recent orders.
  - Dashboard: low stock no longer double-counts out-of-stock; out-of-stock counts active products only;
    revenue excludes cancelled orders.
- Frontend: `/admin` now has a layout with tab navigation and Dashboard, Products, Categories, Orders,
  Customers pages (drawer forms, loading/empty/error states, toasts, pagination).

## Validation (actually run, Linux sandbox, PHP 8.3 / Node 22)
- `php artisan test`: 27 passed, 135 assertions (17 existing + 10 new in AdminManagementTest).
- `tsc -b`: no errors. `oxlint src`: 0 warnings, 0 errors. `vite build`: succeeds.
- NOT done: no browser testing, no MySQL run (tests use in-memory SQLite), no deployment.

## Done (milestone 2: storefront-wide design + motion pass)
- Global: MotionConfig reducedMotion="user", Reveal primitive, route fade transition, tokens/CSS polish,
  Drawer focus trap, shared OrderStatusBadge, theme-color/OG meta.
- Fixed: literal ``` rendered on CartPage and AccountPage, French+mojibake order status labels, hard-coded
  "$100" shipping copy, demo-credentials button in production (now DEV only), a:button nesting on 404,
  hard-coded emerald colours (broke dark mode), invalid hsl(var()) checkbox colour in admin.
- Polished: header (scroll state, active nav), mobile menu, footer, home, catalogue (category chips), product
  gallery (arrows, zoom, keyboard), product cards, wishlist/cart feedback, cart/auth/checkout/account/wishlist.
- Validation: tsc -b 0 errors; oxlint 0 warnings; vite build OK; php artisan test 27 passed (135 assertions).
- NOT done: no browser/visual testing, no Lighthouse run, no real-device responsive check.

## Next exact task
Milestone 3 — visual QA in a real browser (375/768/1280px, light+dark), then deployment docs
(env vars, build/migrate steps), security/headers review, robots.txt/sitemap.

## Known notes
- Frontend `node_modules` in the archive are Windows-only; build was verified in a fresh Linux install.
- Dashboard still formats money with 3 decimals while `formatMoney` uses 2 — unify in the design pass.
