import type { IntelligenceResponse, SynthesisReport } from '@/types/presales'

/** Shared body shape for standalone generators (proposal, tools). */
export interface PresalesToolContext {
  synthesis_report: SynthesisReport
  job_post: string
  intelligence?: IntelligenceResponse
  client_messages?: string
  team_expertise?: string
  constraints?: string
  risk?: unknown
  strategy?: unknown
}

export interface CallScriptPhase {
  title?: string
  name?: string
  duration_minutes?: number
  minutes?: number
  objective?: string
  script?: string
  content?: string
  talking_points?: string[]
}

export interface ObjectionPair {
  objection?: string
  response?: string
  rebuttal?: string
  /** If the model returns framing / technique labels */
  technique?: string
  framing?: string
  persuasion_technique?: string
}

export interface CompetitorArchetype {
  name?: string
  archetype?: string
  one_liner?: string
  positioning?: string
}

export interface FollowUpGenerateBody {
  discussed_summary: string
  next_step: string
  red_flags?: string
  client_name?: string
  job_post?: string
  synthesis_report?: SynthesisReport
}

export interface BriefingCreateBody extends PresalesToolContext {
  title?: string
}

export interface BriefingCreateResponse {
  share?: { path: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
