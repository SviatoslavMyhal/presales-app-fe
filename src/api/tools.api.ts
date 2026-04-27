import type { PresalesToolContext, BriefingCreateBody, BriefingCreateResponse, FollowUpGenerateBody } from '@/features/tools/types'
import { backendApi } from '@/api/backend-client'

/** `POST /api/proposal/generate` — same body shape as other generators. */
export { generateProposal } from '@/api/presales.api'

export async function generateCallScript(body: PresalesToolContext): Promise<unknown> {
  return backendApi.post('call-script/generate', body)
}

export async function generateObjections(body: PresalesToolContext): Promise<unknown> {
  return backendApi.post('objections/generate', body)
}

export async function generateCompetitors(body: PresalesToolContext): Promise<unknown> {
  return backendApi.post('competitors/generate', body)
}

export async function generateFollowUpEmail(body: FollowUpGenerateBody): Promise<unknown> {
  return backendApi.post('follow-up/generate', body)
}

export async function createClientBriefing(body: BriefingCreateBody): Promise<BriefingCreateResponse> {
  const data = await backendApi.post<BriefingCreateResponse>('briefings', body)
  return data
}
