import type {
  CreateReportBody,
  ReportDetail,
  ReportsListResponse
} from './backend-types'
import { backendApi } from './backend-client'

export async function reportsCreate (body: CreateReportBody): Promise<ReportDetail> {
  const data = await backendApi.post('reports', body)
  return data as ReportDetail
}

export async function reportsList (params: { limit?: number, offset?: number }): Promise<ReportsListResponse> {
  const data = await backendApi.get('reports', { params })
  return data as ReportsListResponse
}

export async function reportsGetById (id: string): Promise<ReportDetail> {
  const data = await backendApi.get(`reports/${encodeURIComponent(id)}`)
  return data as ReportDetail
}

export async function reportsDelete (id: string): Promise<void> {
  await backendApi.delete(`reports/${encodeURIComponent(id)}`)
}
