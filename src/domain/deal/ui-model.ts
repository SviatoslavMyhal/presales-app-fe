/**
 * UI-facing helpers — keep components off raw API shapes.
 */

export type Confidence = 'low' | 'medium' | 'high'

export function inferConfidence(raw: unknown): Confidence {
  if (raw == null) {
    return 'medium'
  }
  const s = (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean'
    ? String(raw)
    : JSON.stringify(raw)).toLowerCase()
  if (s.includes('high') || s === '3') {
    return 'high'
  }
  if (s.includes('low') || s === '1') {
    return 'low'
  }
  return 'medium'
}

/** Pull a human-readable string from unknown nested API values. */
export function pickString(v: unknown, maxLen = 400): string | null {
  if (v == null) {
    return null
  }
  if (typeof v === 'string') {
    const t = v.trim()
    return t.length ? t.slice(0, maxLen) : null
  }
  if (typeof v === 'number' || typeof v === 'boolean') {
    return String(v)
  }
  try {
    return JSON.stringify(v).slice(0, maxLen)
  }
  catch {
    return null
  }
}

/** Flatten question categories into labeled groups for lists. */
export function extractDealHeadline(deal: unknown): string {
  if (!deal || typeof deal !== 'object') {
    return 'Deal'
  }
  const o = deal as Record<string, unknown>
  const a
    = pickString(o.title, 200)
      ?? pickString(o.name, 200)
      ?? pickString(o.summary, 200)
      ?? pickString(o.deal_summary, 200)
  return a ?? 'Deal'
}

export function groupDiscoveryQuestions(data: {
  business?: string[]
  technical?: string[]
  risks?: string[]
  scope?: string[]
}): { key: string, label: string, items: string[] }[] {
  const groups: { key: string, label: string, items: string[] }[] = [
    { key: 'business', label: 'Business', items: data.business ?? [] },
    { key: 'technical', label: 'Technical', items: data.technical ?? [] },
    { key: 'risks', label: 'Risks', items: data.risks ?? [] },
    { key: 'scope', label: 'Scope', items: data.scope ?? [] },
  ]
  return groups.filter(g => g.items.length > 0)
}
