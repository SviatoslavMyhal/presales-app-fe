import { getBackendBaseUrl } from '@/api/backend-env'
import { ROUTE_PATHS } from '@/router/routes.config'

/**
 * Shareable permalink for clients: **`${API_URL}${share.path}`** — GET must hit the backend host
 * (not the Vite dev origin). Example: `http://localhost:6969/api/public/briefings/<slug>`.
 */
export function sharePathToBriefingApiUrl(sharePath: string): string {
  const base = getBackendBaseUrl().replace(/\/$/, '')
  const p = sharePath.trim()
  const path = p.startsWith('/') ? p : `/${p}`
  return `${base}${path}`
}

/**
 * Optional SPA URL on the current origin (same slug) for a readable HTML page; data still loads from `VITE_API_URL`.
 */
export function sharePathToBriefingSpaUrl(
  sharePath: string,
  origin: string = typeof window !== 'undefined' ? window.location.origin : '',
): string | null {
  const p = sharePath.trim()
  const m = /\/(?:api\/)?public\/briefings\/([^/?#]+)/i.exec(p)
  if (m?.[1]) {
    return `${origin}${ROUTE_PATHS.publicBriefing(m[1])}`
  }
  const fe = /\/briefing\/([^/?#]+)/i.exec(p)
  if (fe?.[1]) {
    return `${origin}${ROUTE_PATHS.publicBriefing(fe[1])}`
  }
  return null
}
