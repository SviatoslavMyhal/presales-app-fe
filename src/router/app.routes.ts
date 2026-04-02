import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names-registry'

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: routeNames.home,
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Analyze' }
      },
      {
        path: 'login',
        name: routeNames.login,
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Login' }
      },
      {
        path: 'signup',
        name: routeNames.signup,
        component: () => import('@/views/auth/SignupView.vue'),
        meta: { title: 'Sign up' }
      },
      {
        path: 'reports',
        component: () => import('@/views/reports/ReportsLayout.vue'),
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            name: routeNames.reports,
            component: () => import('@/views/reports/ReportsListView.vue'),
            meta: { title: 'My reports' }
          },
          {
            path: 'analytics',
            name: routeNames.reportsAnalytics,
            component: () => import('@/views/reports/AnalyticsView.vue'),
            meta: { title: 'Analytics' }
          }
        ]
      },
      {
        path: 'reports/:id',
        name: routeNames.reportDetail,
        component: () => import('@/views/reports/ReportDetailView.vue'),
        meta: { requiresAuth: true, title: 'Report' }
      }
    ]
  }
]
