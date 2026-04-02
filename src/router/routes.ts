import type { RouteRecordRaw } from 'vue-router'

import { appRoutes } from '@/router/app.routes'

const routes: RouteRecordRaw[] = [
  ...appRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export {
  routes
}
