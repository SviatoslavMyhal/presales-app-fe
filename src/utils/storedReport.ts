import type { IntelligenceResponse, SynthesisReport } from '@/types/presales'

/**
 * Normalize API-stored JSON (full analyze result, analyze/save wrapper, or raw synthesis) to SynthesisReport.
 */
export function extractSynthesisReport(result: unknown): SynthesisReport | null {
  if (!result || typeof result !== 'object') {
    return null
  }
  const o = result as Record<string, unknown>

  // { synthesis: { report: SynthesisReport } } — typical analyze response
  const synDirect = o.synthesis
  if (synDirect && typeof synDirect === 'object') {
    const rep = (synDirect as Record<string, unknown>).report
    if (rep && typeof rep === 'object' && looksLikeSynthesisReport(rep)) {
      return rep as unknown as SynthesisReport
    }
  }

  // { analysis: { ... } } from analyze/save or nested
  const analysis = o.analysis
  if (analysis && typeof analysis === 'object') {
    const a = analysis as Record<string, unknown>
    const innerSyn = a.synthesis
    if (innerSyn && typeof innerSyn === 'object') {
      const rep = (innerSyn as Record<string, unknown>).report
      if (rep && typeof rep === 'object' && looksLikeSynthesisReport(rep)) {
        return rep as unknown as SynthesisReport
      }
    }
    if (looksLikeSynthesisReport(a)) {
      return a as unknown as SynthesisReport
    }
  }

  // Top-level report key
  const report = o.report
  if (report && typeof report === 'object') {
    const r = report as Record<string, unknown>
    if (r.synthesis && typeof r.synthesis === 'object') {
      const rep = (r.synthesis as Record<string, unknown>).report
      if (rep && typeof rep === 'object' && looksLikeSynthesisReport(rep)) {
        return rep as unknown as SynthesisReport
      }
    }
    if (looksLikeSynthesisReport(r)) {
      return r as unknown as SynthesisReport
    }
  }

  // Payload is already a synthesis-shaped object
  if (looksLikeSynthesisReport(o)) {
    return o as unknown as SynthesisReport
  }

  return null
}

function looksLikeSynthesisReport(x: object): boolean {
  if (!x || typeof x !== 'object') {
    return false
  }
  const o = x as Record<string, unknown>
  return (
    typeof o.opportunity_summary === 'string'
    || Array.isArray(o.discovery_questions)
    || Array.isArray(o.risks)
    || o.client_needs !== undefined
  )
}

export interface StoredInputFields {
  jobPost: string
  clientMessages?: string
  teamExpertise?: string
  constraints?: string
}

/**
 * Pull original analyze form fields from stored report JSON (top-level, nested `analysis`, `payload`, `request`).
 */
export function extractStoredInputFields(result: unknown): StoredInputFields {
  const empty: StoredInputFields = { jobPost: '' }
  if (!result || typeof result !== 'object') {
    return empty
  }
  const root = result as Record<string, unknown>
  const layers: Record<string, unknown>[] = [root]
  const analysis = root.analysis
  if (analysis && typeof analysis === 'object') {
    layers.push(analysis as Record<string, unknown>)
  }
  const payload = root.payload
  if (payload && typeof payload === 'object') {
    layers.push(payload as Record<string, unknown>)
  }
  const request = root.request
  if (request && typeof request === 'object') {
    layers.push(request as Record<string, unknown>)
  }
  const input = root.input
  if (input && typeof input === 'object') {
    layers.push(input as Record<string, unknown>)
  }

  for (const o of layers) {
    const jp = o.job_post
    if (typeof jp === 'string' && jp.trim()) {
      return {
        jobPost: jp.trim(),
        clientMessages: typeof o.client_messages === 'string' ? o.client_messages : undefined,
        teamExpertise: typeof o.team_expertise === 'string' ? o.team_expertise : undefined,
        constraints: typeof o.constraints === 'string' ? o.constraints : undefined,
      }
    }
  }
  return empty
}

/**
 * Intelligence snapshot from stored result (`intelligence` or nested under `analysis`).
 */
export function extractStoredIntelligence(result: unknown): IntelligenceResponse | undefined {
  if (!result || typeof result !== 'object') {
    return undefined
  }
  const root = result as Record<string, unknown>
  const candidates: unknown[] = [root.intelligence]
  const analysis = root.analysis
  if (analysis && typeof analysis === 'object') {
    candidates.push((analysis as Record<string, unknown>).intelligence)
  }
  for (const c of candidates) {
    if (!c || typeof c !== 'object') {
      continue
    }
    const o = c as Record<string, unknown>
    if (o.status === 'success' || o.status === 'error') {
      return c as IntelligenceResponse
    }
  }
  return undefined
}

/**
 * Minimal intelligence payload for proposal API when a legacy saved report has no intelligence snapshot.
 */
/**
 * Risk / strategy snapshots from stored full pipeline JSON (for tools APIs).
 */
export function extractPipelineRiskStrategy(result: unknown): { risk?: unknown, strategy?: unknown } {
  if (!result || typeof result !== 'object') {
    return {}
  }
  const root = result as Record<string, unknown>
  const layers: Record<string, unknown>[] = [root]
  const analysis = root.analysis
  if (analysis && typeof analysis === 'object') {
    layers.push(analysis as Record<string, unknown>)
  }
  for (const o of layers) {
    if ('risk' in o || 'strategy' in o) {
      return { risk: o.risk, strategy: o.strategy }
    }
  }
  return {}
}

export function buildStubIntelligenceForProposal(): IntelligenceResponse {
  return {
    status: 'success',
    error: null,
    data: {
      confidence: {
        score: 5,
        label: 'Context unavailable',
        color: 'amber',
        reasons: ['This report was saved without an intelligence snapshot. The proposal still uses your synthesis.'],
      },
      client_type: {
        type: 'Chaotic / unclear',
        confidence_pct: 0,
        warning: true,
        signals: [],
      },
      suggested_pitch: {
        opening: '',
        differentiator: '',
        hook: '',
      },
    },
  }
}
