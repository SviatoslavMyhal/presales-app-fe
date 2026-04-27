import {
  callLiveAssist,
  dealAnalyze,
  dealInsightsGet,
  dealMemoryRecent,
  dealMemorySimilar,
  dealQuestions,
  dealRisks,
  dealSolution,
} from '@/api/deal.api'
import type { DealAnalyzeInput } from '@/types/deal-engine'
import type { DealAnalyzeResponse, DealEngineEnvelope } from '@/types/deal-engine'
import { formatApiError } from '@/utils/api-error'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'

export function useDealWorkspace() {
  const jobPost = ref('')
  const clientMessages = ref('')
  const teamExpertise = ref('')
  const constraints = ref('')

  const dealId = ref<string | null>(null)
  const lastAnalyze = ref<DealAnalyzeResponse | null>(null)
  const pollInsights = ref(true)

  const body = computed((): DealAnalyzeInput => ({
    job_post: jobPost.value.trim(),
    client_messages: clientMessages.value.trim() || undefined,
    team_expertise: teamExpertise.value.trim() || undefined,
    constraints: constraints.value.trim() || undefined,
  }))

  const insightsQuery = useQuery({
    queryKey: computed(() => ['deal', 'insights', dealId.value] as const),
    queryFn: async () => dealInsightsGet(dealId.value!),
    enabled: computed(() => Boolean(pollInsights.value && dealId.value)),
    refetchInterval: computed(() => (pollInsights.value ? 6000 : false)),
  })

  const memoryRecentQuery = useQuery({
    queryKey: ['deal', 'memory', 'recent'],
    queryFn: () => dealMemoryRecent(12),
    staleTime: 30_000,
  })

  const memoryQ = ref('')
  const memorySimilarQuery = useQuery({
    queryKey: computed(() => ['deal', 'memory', 'similar', memoryQ.value] as const),
    queryFn: () => dealMemorySimilar(memoryQ.value.trim(), 6),
    enabled: computed(() => memoryQ.value.trim().length >= 2),
    staleTime: 20_000,
  })

  const analyzeMut = useMutation({
    mutationFn: async () => dealAnalyze(body.value),
    onSuccess: (data) => {
      lastAnalyze.value = data
      const id = data.deal?.id
      dealId.value = typeof id === 'string' ? id : null
    },
  })

  const questionsMut = useMutation({
    mutationFn: async () => dealQuestions(body.value),
  })

  const solutionMut = useMutation({
    mutationFn: async () => dealSolution(body.value),
  })

  const risksMut = useMutation({
    mutationFn: async () => dealRisks(body.value),
  })

  const liveAssistMut = useMutation({
    mutationFn: async (transcript: string) =>
      callLiveAssist({ transcript, job_post: jobPost.value.trim() || undefined }),
  })

  function runAnalyze() {
    return analyzeMut.mutateAsync().catch(() => undefined)
  }

  function refreshInsights() {
    return insightsQuery.refetch()
  }

  return {
    jobPost,
    clientMessages,
    teamExpertise,
    constraints,
    body,
    dealId,
    lastAnalyze,
    pollInsights,
    insightsQuery,
    memoryRecentQuery,
    memorySimilarQuery,
    memoryQ,
    analyzeMut,
    questionsMut,
    solutionMut,
    risksMut,
    liveAssistMut,
    runAnalyze,
    refreshInsights,
    formatApiError,
  }
}

export type DealWorkspaceApi = ReturnType<typeof useDealWorkspace>

/** Narrow envelope success for template guards */
export function isEngineOk<T>(e: DealEngineEnvelope<T> | undefined): boolean {
  if (!e) {
    return false
  }
  const s = (e.status ?? '').toLowerCase()
  return s === 'ok' || s === 'success' || (e.data != null && !s)
}

export type { DealAnalyzeResponse, DealEngineEnvelope }
