import { getBackendBaseUrl } from '@/api/backend-env'

const MIGRATION_004_HINT
  = 'Database migration may be missing. Ask an admin to apply migration 004_get_briefing_by_slug_rpc (function get_briefing_by_slug) on Supabase.'

/** Public fetch without relying on axios interceptors for guest access. */
export async function fetchPublicBriefing(slug: string): Promise<unknown> {
  const url = `${getBackendBaseUrl()}/api/public/briefings/${encodeURIComponent(slug)}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  const text = await res.text().catch(() => '')

  if (res.status === 503) {
    const err = new Error(
      /004|migration|get_briefing_by_slug|rpc/i.test(text)
        ? MIGRATION_004_HINT
        : 'Briefing service is temporarily unavailable.',
    )
    ;(err as Error & { code?: string }).code = 'SERVICE_UNAVAILABLE'
    throw err
  }
  if (!res.ok) {
    let msg = text || `Request failed (${res.status})`
    try {
      const j = JSON.parse(text) as { message?: string, error?: string }
      msg = j.message ?? j.error ?? msg
    }
    catch {
      /* use text */
    }
    throw new Error(msg)
  }
  try {
    return JSON.parse(text) as unknown
  }
  catch {
    throw new Error('Invalid JSON from briefing endpoint')
  }
}
