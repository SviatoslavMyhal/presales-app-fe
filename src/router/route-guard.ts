import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'

export const routeGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({
      name: routeNames.login,
      query: { redirect: to.fullPath }
    })
    return
  }

  next()
}
