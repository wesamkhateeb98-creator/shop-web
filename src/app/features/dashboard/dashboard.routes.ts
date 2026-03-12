import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard-home/dashboard-home.component').then(
        (m) => m.DashboardHomeComponent
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./components/dashboard-products/dashboard-products.component').then(
        (m) => m.DashboardProductsComponent
      ),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./components/dashboard-orders/dashboard-orders.component').then(
        (m) => m.DashboardOrdersComponent
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/dashboard-categories/dashboard-categories.component').then(
        (m) => m.DashboardCategoriesComponent
      ),
  },
  {
    path: 'coupons',
    loadComponent: () =>
      import('./components/dashboard-coupons/dashboard-coupons.component').then(
        (m) => m.DashboardCouponsComponent
      ),
  },
];
