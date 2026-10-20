import { createBrowserRouter } from 'react-router-dom'
import { StoreLayout } from './layouts/StoreLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { AdminRoute, GuestRoute, ProtectedRoute } from '@/features/auth/components/RouteGuards'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RouteError } from '@/pages/RouteError'

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    HydrateFallback: PageSpinner,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/catalog/pages/HomePage')).HomePage,
        }),
      },
      {
        path: 'products',
        lazy: async () => ({
          Component: (await import('@/features/catalog/pages/CatalogPage')).CatalogPage,
        }),
      },
      {
        path: 'products/:slug',
        lazy: async () => ({
          Component: (await import('@/features/catalog/pages/ProductPage')).ProductPage,
        }),
      },
      {
        path: 'cart',
        lazy: async () => ({
          Component: (await import('@/features/cart/pages/CartPage')).CartPage,
        }),
      },
      {
        path: 'status',
        lazy: async () => ({
          Component: (await import('@/features/system/pages/StatusPage')).StatusPage,
        }),
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: 'login',
            lazy: async () => ({
              Component: (await import('@/features/auth/pages/LoginPage')).LoginPage,
            }),
          },
          {
            path: 'register',
            lazy: async () => ({
              Component: (await import('@/features/auth/pages/RegisterPage')).RegisterPage,
            }),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'wishlist',
            lazy: async () => ({
              Component: (await import('@/features/wishlist/pages/WishlistPage')).WishlistPage,
            }),
          },
{
  path: 'checkout',
  lazy: async () => ({
    Component: (await import('@/features/checkout/CheckoutPage')).CheckoutPage,
  }),
},
          {
            path: 'account',
            lazy: async () => ({
              Component: (await import('@/features/account/pages/AccountPage')).AccountPage,
            }),
          },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin',
            lazy: async () => ({
              Component: (await import('@/features/admin/components/AdminLayout')).AdminLayout,
            }),
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/admin/pages/AdminHomePage')).AdminHomePage,
                }),
              },
              {
                path: 'products',
                lazy: async () => ({
                  Component: (await import('@/features/admin/pages/AdminProductsPage')).AdminProductsPage,
                }),
              },
              {
                path: 'categories',
                lazy: async () => ({
                  Component: (await import('@/features/admin/pages/AdminCategoriesPage')).AdminCategoriesPage,
                }),
              },
              {
                path: 'orders',
                lazy: async () => ({
                  Component: (await import('@/features/admin/pages/AdminOrdersPage')).AdminOrdersPage,
                }),
              },
              {
                path: 'customers',
                lazy: async () => ({
                  Component: (await import('@/features/admin/pages/AdminCustomersPage')).AdminCustomersPage,
                }),
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])