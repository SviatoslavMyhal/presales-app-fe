/** GET /api/analytics/summary — aggregated presales analytics (public). */

export interface AnalyticsSummaryBlock {
  total_reports: number
  avg_opportunity_score: number
  avg_confidence: number
}

export interface AnalyticsOpportunitiesBlock {
  high: number
  medium: number
  low: number
}

export interface AnalyticsRisksBlock {
  total_high: number
  most_common: string | null
  distribution: Record<string, number>
}

export interface AnalyticsClientsBlock {
  technical_founder: number
  non_technical_founder: number
  enterprise: number
  agency: number
  chaotic_unclear: number
  other: number
}

export interface AnalyticsConversionSignalsBlock {
  ready_to_start: number
  needs_discovery: number
  high_risk: number
}

export interface AnalyticsTimelinePoint {
  date: string
  reports: number
  avg_score: number
}

export interface AnalyticsSummaryResponse {
  summary: AnalyticsSummaryBlock
  opportunities: AnalyticsOpportunitiesBlock
  risks: AnalyticsRisksBlock
  clients: AnalyticsClientsBlock
  conversion_signals: AnalyticsConversionSignalsBlock
  timeline: AnalyticsTimelinePoint[]
}
