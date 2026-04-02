/** Keys and labels for `AnalyticsSummaryResponse.clients` (backend segment mix). */

export const ANALYTICS_CLIENT_TYPE_ORDER = [
  'technical_founder',
  'non_technical_founder',
  'enterprise',
  'agency',
  'chaotic_unclear',
  'other',
] as const

export type AnalyticsClientTypeKey = (typeof ANALYTICS_CLIENT_TYPE_ORDER)[number]

export const ANALYTICS_CLIENT_TYPE_LABELS: Record<AnalyticsClientTypeKey, string> = {
  technical_founder: 'Technical founder',
  non_technical_founder: 'Non-technical founder',
  enterprise: 'Enterprise',
  agency: 'Agency',
  chaotic_unclear: 'Chaotic / unclear',
  other: 'Other',
}

/** Suffixes for `.stack-bar__seg--ct-*` and `.dot--ct-*` in AnalyticsDashboard. */
export const ANALYTICS_CLIENT_TYPE_STYLE_KEYS: Record<AnalyticsClientTypeKey, string> = {
  technical_founder: 'tf',
  non_technical_founder: 'ntf',
  enterprise: 'ent',
  agency: 'agency',
  chaotic_unclear: 'chaos',
  other: 'other',
}
