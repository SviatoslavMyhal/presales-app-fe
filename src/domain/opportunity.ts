/** Client-side pipeline stage (not persisted to API v1). */
export type OpportunityStage = 'new' | 'ready' | 'scheduled' | 'done' | 'archived'

export const OPPORTUNITY_STAGES: { value: OpportunityStage, label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'ready', label: 'Ready' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
]

export type CallIntent = 'discovery' | 'technical' | 'negotiation'

export interface OpportunityMeta {
  stage: OpportunityStage
  /** ISO datetime for scheduled call (optional). */
  callAt: string | null
  intent: CallIntent | null
  /** Live notes during Perform mode. */
  performScratchpad: string
  /** Post-call debrief. */
  debriefNotes: string
  lastOpenedAt: string | null
}

export function defaultOpportunityMeta(): OpportunityMeta {
  return {
    stage: 'new',
    callAt: null,
    intent: null,
    performScratchpad: '',
    debriefNotes: '',
    lastOpenedAt: null,
  }
}

const STALE_MS = 7 * 24 * 60 * 60 * 1000
const DUE_SOON_MS = 48 * 60 * 60 * 1000

export function isStale(updatedAtIso: string, stage: OpportunityStage): boolean {
  if (stage === 'done' || stage === 'archived') {
    return false
  }
  const t = Date.parse(updatedAtIso)
  if (Number.isNaN(t)) {
    return false
  }
  return Date.now() - t > STALE_MS
}

/** Call is within the next 48h (and optionally in ready/scheduled). */
export function isDueSoon(callAtIso: string | null, stage: OpportunityStage): boolean {
  if (!callAtIso || stage === 'done' || stage === 'archived') {
    return false
  }
  const t = Date.parse(callAtIso)
  if (Number.isNaN(t)) {
    return false
  }
  const now = Date.now()
  return t >= now && t - now <= DUE_SOON_MS
}

export function needsMoreInput(title: string | null): boolean {
  const t = (title ?? '').trim().toLowerCase()
  return !t || t === 'untitled' || t === 'untitled report'
}
