import type {
  DealAnalyzeInput,
  DealAnalyzeResponse,
  DealEngineEnvelope,
  DealInsightsResponse,
  DealQuestionsData,
  LiveAssistBody,
} from '@/types/deal-engine'
import {
  backendApi,
  backendApiAbsoluteUrl,
  getBackendFetchAuthHeaders,
} from '@/api/backend-client'
import { PRESALES_AI_UNAVAILABLE_MESSAGE } from '@/utils/api-error'

function assertOkStatus(status: number, text: string): void {
  if (status === 503) {
    const hint
      = /dist\/presales-ai|npm run build|presales-ai/i.test(text)
        ? PRESALES_AI_UNAVAILABLE_MESSAGE
        : text || PRESALES_AI_UNAVAILABLE_MESSAGE
    throw new Error(hint)
  }
}

export async function dealAnalyze(body: DealAnalyzeInput): Promise<DealAnalyzeResponse> {
  const data = await backendApi.post('deal/analyze', body)
  return data as DealAnalyzeResponse
}

export async function dealQuestions(body: DealAnalyzeInput): Promise<DealEngineEnvelope<DealQuestionsData>> {
  const data = await backendApi.post('deal/questions', body)
  return data as DealEngineEnvelope<DealQuestionsData>
}

export async function dealSolution(body: DealAnalyzeInput): Promise<DealEngineEnvelope<unknown>> {
  const data = await backendApi.post('deal/solution', body)
  return data as DealEngineEnvelope<unknown>
}

export async function dealRisks(body: DealAnalyzeInput): Promise<DealEngineEnvelope<unknown>> {
  const data = await backendApi.post('deal/risks', body)
  return data as DealEngineEnvelope<unknown>
}

export async function dealInsightsGet(dealId: string): Promise<DealInsightsResponse> {
  const data = await backendApi.get(`deal/${encodeURIComponent(dealId)}/insights`)
  return data as DealInsightsResponse
}

export async function dealMemoryRecent(limit = 10): Promise<unknown> {
  const q = new URLSearchParams({ limit: String(limit) })
  return backendApi.get(`deal/memory/recent?${q.toString()}`)
}

export async function dealMemorySimilar(q: string, topK = 5): Promise<unknown> {
  const params = new URLSearchParams({ q, topK: String(topK) })
  return backendApi.get(`deal/memory/similar?${params.toString()}`)
}

export async function callLiveAssist(body: LiveAssistBody): Promise<DealEngineEnvelope<unknown>> {
  const data = await backendApi.post('call/live-assist', body)
  return data as DealEngineEnvelope<unknown>
}

export interface LiveAssistStreamHandlers {
  onToken?: (token: string) => void
  onDone?: () => void
  onError?: (err: Error) => void
}

/**
 * `POST /api/call/live-assist/stream` — SSE (`data:` JSON lines, `event: done`).
 * Uses `fetch` because Axios does not stream SSE ergonomically in the browser.
 */
export async function callLiveAssistStream(
  body: LiveAssistBody,
  handlers: LiveAssistStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const url = backendApiAbsoluteUrl('call/live-assist/stream')
  const res = await fetch(url, {
    method: 'POST',
    headers: getBackendFetchAuthHeaders({ Accept: 'text/event-stream' }),
    body: JSON.stringify(body),
    signal,
  })

  const textPreview = await res.clone().text().catch(() => '')
  assertOkStatus(res.status, textPreview)

  if (!res.ok) {
    throw new Error(textPreview || `Request failed (${res.status})`)
  }

  const reader = res.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  let sawDoneEvent = false
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trimEnd()
        if (!trimmed) {
          continue
        }
        if (trimmed.startsWith('event:')) {
          const ev = trimmed.slice(6).trim()
          if (ev === 'done') {
            sawDoneEvent = true
            handlers.onDone?.()
          }
          continue
        }
        if (trimmed.startsWith('data:')) {
          const raw = trimmed.slice(5).trim()
          if (raw === '[DONE]' || raw === '') {
            continue
          }
          try {
            const j = JSON.parse(raw) as { token?: string }
            if (typeof j.token === 'string' && j.token.length > 0) {
              handlers.onToken?.(j.token)
            }
          }
          catch {
            /* ignore partial JSON */
          }
        }
      }
    }
    if (!sawDoneEvent) {
      handlers.onDone?.()
    }
  }
  catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    handlers.onError?.(err)
    throw err
  }
}
