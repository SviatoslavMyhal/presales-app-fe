/**
 * Canonical path helpers and route metadata. Keep route names in `route-names-registry` (generated from `app.routes.ts`).
 */
export const ROUTE_PATHS = {
  home: '/',
  analyze: '/analyze',
  login: '/login',
  signup: '/signup',
  today: '/workspace/today',
  pipeline: '/workspace/pipeline',
  insights: '/workspace/insights',
  dealWorkspace: '/workspace/deal',
  liveAssist: '/workspace/live-assist',
  opportunityDetail: (id: string) => `/workspace/opportunity/${id}`,
  publicBriefing: (slug: string) => `/briefing/${slug}`,
} as const

/** Whether a path matches authenticated workspace routes. */
export function requiresAuthPath(path: string): boolean {
  return path === '/workspace' || path.startsWith('/workspace/')
}
