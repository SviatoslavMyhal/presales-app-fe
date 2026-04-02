import type { AnalyticsSummaryResponse } from './analytics.types'
import { backendApi } from './backend-client'

export async function fetchAnalyticsSummary (): Promise<AnalyticsSummaryResponse> {
  const data = await backendApi.get('analytics/summary')
  return data as AnalyticsSummaryResponse
}
