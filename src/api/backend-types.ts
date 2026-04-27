/** Session returned from signup/login when auth succeeds */
export interface AuthSession {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

export interface AuthUser {
  id: string
  email: string
}

export interface SignupLoginResponse {
  user?: AuthUser
  session?: AuthSession
}

export interface AuthMeResponse {
  user: AuthUser
}

export interface PresalesAnalyzeBody {
  job_post: string
  client_messages?: string
  team_expertise?: string
  constraints?: string
}

export interface AnalyzeSaveBody extends PresalesAnalyzeBody {
  title?: string
}

/** Full multi-agent analyze result (shape may vary by backend) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PresalesAnalyzeResult = Record<string, any>

export interface AnalyzeSaveResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report?: any
  analysis: PresalesAnalyzeResult
}

export interface CreateReportBody {
  title?: string
  /** Job description text stored with the report for list/detail previews. */
  job_post?: string
  payload: Record<string, unknown>
}

export interface ReportListItem {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
  /** Short job text for pipeline cards (when API returns it). */
  job_post?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any
}

export interface ReportsListResponse {
  reports: ReportListItem[]
  /** Present when the API paginates; omitted when returning the full list. */
  limit?: number
  offset?: number
}

export interface ReportDetail {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
  /** Original project / job description when returned from GET report (optional). */
  job_post?: string | null

  result: Record<string, unknown>
}
