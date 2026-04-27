import type { PresalesToolContext } from '@/features/tools/types'
import type { IntelligenceResponse, PresalesRequest, SynthesisReport } from '@/types/presales'
import { buildStubIntelligenceForProposal } from '@/utils/storedReport'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export interface ToolContextInput {
  report: MaybeRefOrGetter<SynthesisReport>
  intelligence: MaybeRefOrGetter<IntelligenceResponse | null | undefined>
  jobPost: MaybeRefOrGetter<string>
  clientMessages?: MaybeRefOrGetter<string | undefined>
  teamExpertise?: MaybeRefOrGetter<string | undefined>
  constraints?: MaybeRefOrGetter<string | undefined>
  risk?: MaybeRefOrGetter<unknown>
  strategy?: MaybeRefOrGetter<unknown>
}

export function usePresalesToolContext(input: ToolContextInput) {
  const body = computed((): PresalesToolContext => {
    const intel = toValue(input.intelligence)
    const resolved: IntelligenceResponse
      = intel?.status === 'success' && intel.data
        ? intel
        : buildStubIntelligenceForProposal()

    const ctx: PresalesToolContext = {
      synthesis_report: toValue(input.report),
      job_post: toValue(input.jobPost)?.trim() ?? '',
      intelligence: resolved,
      risk: toValue(input.risk),
      strategy: toValue(input.strategy),
    }
    const cm = toValue(input.clientMessages)?.trim()
    const te = toValue(input.teamExpertise)?.trim()
    const co = toValue(input.constraints)?.trim()
    if (cm) ctx.client_messages = cm
    if (te) ctx.team_expertise = te
    if (co) ctx.constraints = co
    return ctx
  })

  return { body }
}

export function presalesRequestFromToolContext(
  ctx: PresalesToolContext,
): PresalesRequest {
  return {
    job_post: ctx.job_post,
    ...(ctx.client_messages ? { client_messages: ctx.client_messages } : {}),
    ...(ctx.team_expertise ? { team_expertise: ctx.team_expertise } : {}),
    ...(ctx.constraints ? { constraints: ctx.constraints } : {}),
  }
}
