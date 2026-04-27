/**
 * Canonical HTTP entry for the presales backend — wraps the shared Axios instance.
 * Prefer importing from here for new code; `backend-client.ts` remains the implementation.
 */
export {
  AUTH_STORAGE_KEYS,
  backendApi,
  backendApiAbsoluteUrl,
  getBackendFetchAuthHeaders,
  getStoredAccessToken,
  setBackendUnauthorizedHandler,
} from './backend-client'
export type { PresalesBackendHttp } from './backend-client'
export { getBackendBaseUrl } from './backend-env'
