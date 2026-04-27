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
        meta: { title: 'PreSales AI' },
      },
      {
        path: 'analyze',
        name: routeNames.analyze,
        component: () => import('@/views/AnalyzeView.vue'),
        meta: { title: 'Capture' },
      },
      {
        path: 'login',
        name: routeNames.login,
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Login' },
      },
      {
        path: 'signup',
        name: routeNames.signup,
        component: () => import('@/views/auth/SignupView.vue'),
        meta: { title: 'Sign up' },
      },
      {
        path: 'workspace',
        component: () => import('@/layouts/WorkspaceLayout.vue'),
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            redirect: { name: routeNames.today },
          },
          {
            path: 'today',
            name: routeNames.today,
            component: () => import('@/views/workspace/TodayView.vue'),
            meta: { title: 'Today' },
          },
          {
            path: 'pipeline',
            name: routeNames.pipeline,
            component: () => import('@/views/workspace/PipelineView.vue'),
            meta: { title: 'Pipeline' },
          },
          {
            path: 'insights',
            name: routeNames.reportsAnalytics,
            component: () => import('@/views/reports/AnalyticsView.vue'),
            meta: { title: 'Insights' },
          },
          {
            path: 'deal',
            name: routeNames.dealWorkspace,
            component: () => import('@/views/workspace/DealWorkspaceView.vue'),
            meta: { title: 'Deal engine' },
          },
          {
            path: 'live-assist',
            name: routeNames.liveAssist,
            component: () => import('@/views/workspace/LiveCallModeView.vue'),
            meta: { title: 'Live assist' },
          },
          {
            path: 'opportunity/:id',
            name: routeNames.opportunityDetail,
            component: () => import('@/views/workspace/OpportunityDetailView.vue'),
            meta: { title: 'Opportunity' },
          },
        ],
      },
      {
        path: 'reports',
        redirect: '/workspace/pipeline',
      },
      {
        path: 'reports/analytics',
        redirect: '/workspace/insights',
      },
      {
        path: 'reports/:id',
        redirect: (to) => {
          const raw = to.params.id
          const id = Array.isArray(raw) ? raw[0] : raw
          return {
            path: `/workspace/opportunity/${id ?? ''}`,
            query: to.query,
          }
        },
      },
    ],
  },
]

/** Public routes without app chrome (share links, etc.) */
export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/briefing/:slug',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        name: routeNames.publicBriefing,
        component: () => import('@/views/briefing/PublicBriefingView.vue'),
        meta: { title: 'Client briefing', public: true },
      },
    ],
  },
]
