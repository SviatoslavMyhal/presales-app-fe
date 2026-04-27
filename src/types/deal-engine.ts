import type { PresalesAnalyzeBody } from '@/api/backend-types'

/** Response from `POST /api/deal/analyze` — shapes vary by backend version. */
export interface DealAnalyzeResponse {
  deal: DealRecord
  pipeline?: unknown
  insights?: unknown
}

export interface DealRecord {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/** `GET /api/deal/:id/insights` */
export interface DealInsightsResponse {
  deal: DealRecord
  insights: unknown
}

/** Engines that return `{ status, data }` wrappers */
export interface DealEngineEnvelope<T = unknown> {
  status?: string
  data?: T
  message?: string
}

export interface DealQuestionsData {
  business?: string[]
  technical?: string[]
  risks?: string[]
  scope?: string[]
}

export interface LiveAssistBody {
  transcript: string
  job_post?: string
}

export type DealAnalyzeInput = PresalesAnalyzeBody
