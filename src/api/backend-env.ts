/** Base URL for the presales backend (no trailing slash). */
export function getBackendBaseUrl(): string {
  const raw
    = import.meta.env.VITE_API_BASE_URL
      ?? import.meta.env.VITE_API_URL
      ?? import.meta.env.NEXT_PUBLIC_API_URL
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}
