/**
 * Proposal drawer: API-backed generation, phase machine, and clipboard copy with timed reset.
 */
import { generateProposal } from '@/api/presales.api'
import type { IntelligenceResponse, ProposalData, SynthesisReport } from '@/types/presales'
import { computed, onUnmounted, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'

const COPY_RESET_MS = 2500

function buildPlainText(p: ProposalData): string {
  const lines: string[] = [
    `Subject: ${p.subject}`,
    '',
    p.greeting,
    '',
    ...p.sections.flatMap(s => [`${s.title}`, s.content, '']),
    p.closing,
    '',
    p.signature,
  ]
  return lines.join('\n')
}

function cloneProposalData(data: ProposalData): ProposalData {
  if (typeof structuredClone === 'function') {
    return structuredClone(data)
  }
  return JSON.parse(JSON.stringify(data)) as ProposalData
}

export interface UseProposalGeneratorParams {
  visible: MaybeRefOrGetter<boolean>
  report: MaybeRefOrGetter<SynthesisReport>
  intelligence: MaybeRefOrGetter<IntelligenceResponse>
  jobPost: MaybeRefOrGetter<string>
  clientMessages?: MaybeRefOrGetter<string | undefined>
  teamExpertise?: MaybeRefOrGetter<string | undefined>
  constraints?: MaybeRefOrGetter<string | undefined>
}

export function useProposalGenerator(params: UseProposalGeneratorParams) {
  const senderName = ref('')
  const companyName = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const proposal = ref<ProposalData | null>(null)
  /** Editable copy in the result phase; `handleCopy` uses this, not the raw API snapshot. */
  const proposalDraft = ref<ProposalData | null>(null)
  const copied = ref(false)
  const phase = ref<'form' | 'generating' | 'result'>('form')

  let copyResetTimer: ReturnType<typeof setTimeout> | undefined

  watch(
    () => toValue(params.visible),
    (val) => {
      if (val) {
        phase.value = 'form'
        error.value = null
        proposal.value = null
        proposalDraft.value = null
      }
    },
  )

  onUnmounted(() => {
    if (copyResetTimer !== undefined) {
      clearTimeout(copyResetTimer)
    }
  })

  const canSubmit = computed(() => !loading.value)

  async function handleGenerate(): Promise<void> {
    if (!canSubmit.value) {
      return
    }
    loading.value = true
    error.value = null
    phase.value = 'generating'

    try {
      const result = await generateProposal({
        synthesis_report: toValue(params.report),
        intelligence: toValue(params.intelligence),
        job_post: toValue(params.jobPost),
        client_messages: toValue(params.clientMessages) ?? '',
        team_expertise: toValue(params.teamExpertise) ?? '',
        constraints: toValue(params.constraints) ?? '',
        sender_name: senderName.value.trim(),
        company_name: companyName.value.trim(),
      })

      if (result.status === 'error' || !result.data) {
        throw new Error(result.error ?? 'Generation failed')
      }

      proposal.value = result.data
      proposalDraft.value = cloneProposalData(result.data)
      phase.value = 'result'
    }
    catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed'
      error.value = msg
      phase.value = 'form'
    }
    finally {
      loading.value = false
    }
  }

  function handleRegenerate(): void {
    proposal.value = null
    proposalDraft.value = null
    phase.value = 'form'
  }

  async function handleCopy(): Promise<void> {
    const draft = proposalDraft.value
    if (!draft) {
      return
    }
    const text = buildPlainText(draft)
    await navigator.clipboard.writeText(text)
    copied.value = true
    if (copyResetTimer !== undefined) {
      clearTimeout(copyResetTimer)
    }
    copyResetTimer = setTimeout(() => {
      copied.value = false
      copyResetTimer = undefined
    }, COPY_RESET_MS)
  }

  return {
    senderName,
    companyName,
    error,
    proposal,
    proposalDraft,
    copied,
    phase,
    canSubmit,
    handleGenerate,
    handleRegenerate,
    handleCopy,
  }
}
