/** Base URL for the presales backend (no trailing slash). */
export function getBackendBaseUrl (): string {
  const raw = import.meta.env.VITE_API_URL
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}
