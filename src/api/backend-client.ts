import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { getBackendBaseUrl } from './backend-env'

/** Narrow axios calls — OpenAPI-augmented `AxiosInstance` only allows demo `/api/v1/*` paths. */
export type PresalesBackendHttp = {
  get: <T = unknown>(url: string, config?: object) => Promise<T>
  post: <T = unknown>(url: string, data?: unknown, config?: object) => Promise<T>
  delete: <T = unknown>(url: string, config?: object) => Promise<T>
}

/** sessionStorage keys — dev-friendly; see README for tradeoffs */
export const AUTH_STORAGE_KEYS = {
  accessToken: 'presales:access_token',
  refreshToken: 'presales:refresh_token'
} as const

let unauthorizedHandler: (() => void) | undefined

export function setBackendUnauthorizedHandler (fn: (() => void) | undefined): void {
  unauthorizedHandler = fn
}

function getStoredAccessToken (): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
}

/**
 * Axios instance for the presales backend (paths outside OpenAPI demo schema).
 * Response interceptor unwraps JSON body; request adds Bearer when token exists.
 */
function createBackendAxios (): AxiosInstance {
  const instance = axios.create({
    baseURL: `${getBackendBaseUrl()}/api`,
    headers: {
      'Content-Type': 'application/json'
    },
    validateStatus: (status) => status >= 200 && status < 300
  })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken()
    if (token) {
      const h = config.headers
      if (h && typeof h.set === 'function') {
        h.set('Authorization', `Bearer ${token}`)
      } else if (h && typeof h === 'object') {
        (h as Record<string, string>)['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  })

  instance.interceptors.response.use(
    (res) => res.data,
    (err: AxiosError) => {
      if (err.response?.status === 401) {
        unauthorizedHandler?.()
      }
      return Promise.reject(err)
    }
  )

  return instance
}

export const backendApi = createBackendAxios() as unknown as PresalesBackendHttp
