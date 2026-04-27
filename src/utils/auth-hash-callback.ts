import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'

import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'

/** Supabase-style auth redirect: #access_token=...&refresh_token=...&type=signup|email */
export async function handleAuthHashCallback(router: Router): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  const raw = window.location.hash
  if (!raw || raw.length <= 1) {
    return false
  }

  const params = new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw)
  const accessToken = params.get('access_token')
  const type = params.get('type')

  if (!accessToken) {
    return false
  }

  if (type !== 'signup' && type !== 'email') {
    return false
  }

  const auth = useAuthStore()
  auth.persistSession({
    access_token: accessToken,
    refresh_token: params.get('refresh_token') ?? undefined,
  })

  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(window.history.state, '', cleanUrl)

  await auth.hydrateUser({ clearOnError: false })

  ElMessage.success('Registration confirmed successfully.')
  await router.replace({ name: routeNames.login })
  return true
}
