import axios from 'axios'

/** Shown when PreSalesAI routes return 503 (server module not built). */
export const PRESALES_AI_UNAVAILABLE_MESSAGE
  = 'PreSalesAI is unavailable: run `npm run build` on the backend so `dist/presales-ai` exists, then restart the server.'

export function formatApiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status
    const rawText
      = typeof e.response?.data === 'string'
        ? e.response.data
        : ''
    if (status === 503) {
      const blob = JSON.stringify(e.response?.data ?? '')
      if (/presales-ai|dist\/presales-ai|npm run build/i.test(rawText + blob)) {
        return PRESALES_AI_UNAVAILABLE_MESSAGE
      }
    }
    const data = e.response?.data
    if (data && typeof data === 'object') {
      const msg = (data as { message?: unknown, error?: unknown }).message
        ?? (data as { message?: unknown, error?: unknown }).error
      if (typeof msg === 'string') return msg
      if (Array.isArray(msg)) return msg.join(', ')
    }
    if (status) {
      return `Request failed (${status})`
    }
    return e.message || 'Request failed'
  }
  if (e instanceof Error) return e.message
  return 'Something went wrong'
}
