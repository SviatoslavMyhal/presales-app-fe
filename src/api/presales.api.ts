import type {
  AnalyzeSaveBody,
  AnalyzeSaveResponse,
  PresalesAnalyzeBody,
  PresalesAnalyzeResult
} from './backend-types'
import type { ProposalRequest, ProposalResponse } from '@/types/presales'
import { backendApi } from './backend-client'

export async function presalesAnalyze (body: PresalesAnalyzeBody): Promise<PresalesAnalyzeResult> {
  const data = await backendApi.post('presales/analyze', body)
  return data as PresalesAnalyzeResult
}

export async function presalesAnalyzeSave (body: AnalyzeSaveBody): Promise<AnalyzeSaveResponse> {
  const data = await backendApi.post('presales/analyze/save', body)
  return data as AnalyzeSaveResponse
}

export async function generateProposal (payload: ProposalRequest): Promise<ProposalResponse> {
  const data = await backendApi.post<ProposalResponse>('proposal/generate', payload)
  return data
}
