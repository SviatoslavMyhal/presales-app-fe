import axios from 'axios'

export function formatApiError (e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data
    if (data && typeof data === 'object') {
      const msg = (data as { message?: unknown, error?: unknown }).message
        ?? (data as { message?: unknown, error?: unknown }).error
      if (typeof msg === 'string') return msg
      if (Array.isArray(msg)) return msg.join(', ')
    }
    if (e.response?.status) {
      return `Request failed (${e.response.status})`
    }
    return e.message || 'Request failed'
  }
  if (e instanceof Error) return e.message
  return 'Something went wrong'
}
