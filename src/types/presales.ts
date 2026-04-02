export interface PresalesRequest {
  job_post: string
  client_messages?: string
  team_expertise?: string
  constraints?: string
}

export interface ClientNeeds {
  main_need: string
  hidden_needs: string[]
}

export interface DiscoveryQuestion {
  question: string
  category: string
  why_it_matters: string
}

export interface Risk {
  risk: string
  severity: 'low' | 'medium' | 'high'
  type: string
  mitigation_hint: string
}

export interface PositioningStatement {
  statement: string
  angle: string
}

export interface SolutionPoint {
  point: string
  type: string
}

export interface QuestionToLeadWith {
  question: string
  reason: string
}

export interface CallStrategy {
  primary_goal: string
  focus_areas: string[]
  questions_to_lead_with: QuestionToLeadWith[]
  tone: string
  desired_outcome: string
}

export interface SynthesisReport {
  opportunity_summary: string
  client_needs: ClientNeeds
  discovery_questions: DiscoveryQuestion[]
  risks: Risk[]
  suggested_positioning: PositioningStatement[]
  solution_approach: SolutionPoint[]
  call_strategy: CallStrategy
  final_prep_note: string
}

export interface ConfidenceData {
  score: number
  label: string
  color: 'green' | 'amber' | 'red'
  reasons: string[]
}

export interface ClientTypeData {
  type: 'Technical Founder' | 'Non-technical Founder' | 'Enterprise' | 'Agency' | 'Chaotic / unclear'
  confidence_pct: number
  warning: boolean
  signals: string[]
}

export interface SuggestedPitchData {
  opening: string
  differentiator: string
  hook: string
}

export interface IntelligenceData {
  confidence: ConfidenceData
  client_type: ClientTypeData
  suggested_pitch: SuggestedPitchData
}

export interface IntelligenceResponse {
  status: 'success' | 'error'
  error: string | null
  data: IntelligenceData | null
}

export interface ProposalSection {
  title: string
  content: string
}

export interface ProposalMeta {
  estimated_read_time_seconds: number
  tone: string
  word_count: number
}

export interface ProposalData {
  subject: string
  greeting: string
  sections: ProposalSection[]
  closing: string
  signature: string
  meta: ProposalMeta
}

export interface ProposalResponse {
  status: 'success' | 'error'
  error: string | null
  data: ProposalData | null
}

export interface ProposalRequest {
  synthesis_report: SynthesisReport
  intelligence: IntelligenceResponse
  job_post: string
  client_messages?: string
  team_expertise?: string
  constraints?: string
  sender_name?: string
  company_name?: string
}

export interface PresalesResponse {
  analyst: {
    status: string
    validation: string
    error: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  }
  risk: {
    status: string
    error: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  }
  strategy: {
    status: string
    error: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  }
  synthesis: {
    status: string
    error: string | null
    report: SynthesisReport
  }
  intelligence: IntelligenceResponse
}
