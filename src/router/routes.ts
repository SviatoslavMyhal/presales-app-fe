import type { RouteRecordRaw } from 'vue-router'

import { appRoutes, publicRoutes } from '@/router/app.routes'

const routes: RouteRecordRaw[] = [
  ...appRoutes,
  ...publicRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export {
  routes,
}
