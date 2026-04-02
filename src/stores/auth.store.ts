import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authLogin, authMe, authSignup } from '@/api/auth.api'
import { AUTH_STORAGE_KEYS, setBackendUnauthorizedHandler } from '@/api/backend-client'
import type { AuthUser } from '@/api/backend-types'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function readFromStorage (): void {
    if (typeof sessionStorage === 'undefined') return
    accessToken.value = sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
    refreshToken.value = sessionStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)
  }

  function persistSession (session: { access_token: string, refresh_token?: string }): void {
    accessToken.value = session.access_token
    sessionStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.access_token)
    if (session.refresh_token) {
      refreshToken.value = session.refresh_token
      sessionStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refresh_token)
    }
  }

  function clearSession (): void {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.accessToken)
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken)
  }

  async function hydrateUser (options?: { clearOnError?: boolean }): Promise<void> {
    readFromStorage()
    if (!accessToken.value) return
    try {
      const res = await authMe()
      user.value = res.user
    } catch {
      if (options?.clearOnError !== false) {
        clearSession()
      }
    }
  }

  async function login (email: string, password: string): Promise<void> {
    clearSession()
    const res = await authLogin({ email, password })
    if (res.session?.access_token) {
      persistSession(res.session)
    }
    if (res.user) {
      user.value = res.user
    } else {
      await hydrateUser()
    }
  }

  async function signup (email: string, password: string): Promise<void> {
    clearSession()
    const res = await authSignup({ email, password })
    if (res.session?.access_token) {
      persistSession(res.session)
    }
    if (res.user) {
      user.value = res.user
    } else {
      await hydrateUser()
    }
  }

  function logout (): void {
    clearSession()
  }

  function registerUnauthorizedRedirect (navigate: () => void): void {
    setBackendUnauthorizedHandler(() => {
      clearSession()
      navigate()
    })
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    readFromStorage,
    persistSession,
    clearSession,
    hydrateUser,
    login,
    signup,
    logout,
    registerUnauthorizedRedirect
  }
})
