<script setup lang="ts">
import CopyButton from '@/components/ui/CopyButton.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import {
  createClientBriefing,
  generateCallScript,
  generateCompetitors,
  generateFollowUpEmail,
  generateObjections,
} from '@/api/tools.api'
import type { CallScriptPhase, ObjectionPair, PresalesToolContext } from '@/features/tools/types'
import type { ReportKitTabId } from '@/types/report-kit'
import { usePresalesToolContext } from '@/composables/usePresalesToolContext'
import type { IntelligenceResponse, SynthesisReport } from '@/types/presales'
import { formatApiError } from '@/utils/api-error'
import { sharePathToBriefingApiUrl, sharePathToBriefingSpaUrl } from '@/utils/briefingShareUrl'
import { assertGeneratorSuccess } from '@/utils/generatorResponse'
import { useAuthStore } from '@/stores/auth.store'
import { ElMessage } from 'element-plus'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    visible: boolean
    report: SynthesisReport
    intelligence: IntelligenceResponse
    jobPost: string
    clientMessages?: string
    teamExpertise?: string
    constraints?: string
    pipelineRisk?: unknown
    pipelineStrategy?: unknown
    /** Which section to show when the kit opens (from header or action strip). */
    initialTab?: ReportKitTabId
  }>(),
  { initialTab: 'call' },
)

const emit = defineEmits<{ close: [] }>()

const auth = useAuthStore()

const { body: toolBody } = usePresalesToolContext({
  report: () => props.report,
  intelligence: () => props.intelligence,
  jobPost: () => props.jobPost,
  clientMessages: () => props.clientMessages,
  teamExpertise: () => props.teamExpertise,
  constraints: () => props.constraints,
  risk: () => props.pipelineRisk,
  strategy: () => props.pipelineStrategy,
})

const tab = ref<ReportKitTabId>('call')

const railItems: { id: ReportKitTabId, label: string, hint: string }[] = [
  { id: 'call', label: 'Script', hint: 'Call flow' },
  { id: 'objections', label: 'Objections', hint: 'Comebacks' },
  { id: 'competitors', label: 'Alternatives', hint: 'Other options' },
  { id: 'followup', label: 'Email', hint: 'Follow-up' },
  { id: 'briefing', label: 'Share', hint: 'Client page' },
]
const loading = ref(false)
const error = ref<string | null>(null)

/** Raw per-tab payloads */
const callRaw = ref<unknown>(null)
const objectionsRaw = ref<unknown>(null)
const competitorsRaw = ref<unknown>(null)
const followUpRaw = ref<unknown>(null)
/** Permalink on the API host: `${API_URL}${share.path}` */
const briefingShareUrl = ref<string | null>(null)
/** Same briefing on the SPA (`/briefing/:slug`) for human-readable HTML. */
const briefingSpaUrl = ref<string | null>(null)

const discussed = ref('')
const nextStep = ref('')
const redFlags = ref('')
const clientName = ref('')

let timerId: ReturnType<typeof setInterval> | undefined
const elapsedSec = ref(0)
const timerRunning = ref(false)

function startTimer() {
  if (timerRunning.value) return
  timerRunning.value = true
  timerId = setInterval(() => {
    elapsedSec.value += 1
  }, 1000)
}

function pauseTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = undefined
  }
  timerRunning.value = false
}

function resetTimer() {
  pauseTimer()
  elapsedSec.value = 0
}

onUnmounted(() => {
  pauseTimer()
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
})

const elapsedLabel = computed(() => {
  const s = elapsedSec.value
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
})

const callPhases = computed((): CallScriptPhase[] => {
  const raw = unwrapEnvelope(callRaw.value)
  if (!raw) return []
  const timeline = raw.timeline as Record<string, unknown> | undefined
  const phases = raw.phases ?? timeline?.phases
  return Array.isArray(phases) ? (phases as CallScriptPhase[]) : []
})

function normalizeObjection(raw: unknown): ObjectionPair & { technique?: string } {
  if (!raw || typeof raw !== 'object') {
    return { objection: 'Objection' }
  }
  const o = raw as Record<string, unknown>
  const technique
    = typeof o.technique === 'string'
      ? o.technique
      : typeof o.framing === 'string'
        ? o.framing
        : typeof o.persuasion_technique === 'string'
          ? o.persuasion_technique
          : undefined
  return {
    objection: typeof o.objection === 'string' ? o.objection : undefined,
    response: typeof o.response === 'string' ? o.response : undefined,
    rebuttal: typeof o.rebuttal === 'string' ? o.rebuttal : undefined,
    technique,
  }
}

const objectionPairs = computed((): (ObjectionPair & { technique?: string })[] => {
  const raw = unwrapEnvelope(objectionsRaw.value)
  const pairs = raw?.objections ?? raw?.pairs ?? raw?.items
  if (!Array.isArray(pairs)) return []
  return pairs.map(normalizeObjection)
})

/** Cumulative minutes for call timeline (0 if durations missing). */
const phaseTimelineMeta = computed(() => {
  let acc = 0
  return callPhases.value.map((p) => {
    const raw = p.duration_minutes ?? p.minutes
    const dur = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
    const start = acc
    acc += dur
    return { startMin: start, endMin: acc, durMin: dur }
  })
})

const hasCallDurations = computed(() =>
  phaseTimelineMeta.value.some(m => m.durMin > 0),
)

const competitorItems = computed((): Record<string, unknown>[] => {
  const raw = unwrapEnvelope(competitorsRaw.value)
  const list
    = raw?.scenarios
      ?? raw?.competitors
      ?? raw?.archetypes
      ?? raw?.items
  return Array.isArray(list) ? (list as Record<string, unknown>[]) : []
})

const competitorsMeta = computed((): Record<string, unknown> | null => {
  const raw = unwrapEnvelope(competitorsRaw.value)
  if (!raw?.meta || typeof raw.meta !== 'object') {
    return null
  }
  return raw.meta as Record<string, unknown>
})

const competitorsClientTypeLabel = computed(() => {
  const t = competitorsMeta.value?.primary_client_type
  return typeof t === 'string' && t.trim() ? t.trim() : ''
})

const competitorsPlainAll = computed(() => {
  const lines: string[] = []
  if (competitorsClientTypeLabel.value) {
    lines.push(`Buyer context: ${competitorsClientTypeLabel.value}`, '')
  }
  for (const c of competitorItems.value) {
    lines.push(`## ${compTitle(c)}`, '')
    if (scenarioOneLiner(c)) {
      lines.push(scenarioOneLiner(c), '')
    }
    if (scenarioLikelyWhen(c)) {
      lines.push(`Likely when: ${scenarioLikelyWhen(c)}`, '')
    }
    if (scenarioAdvantage(c)) {
      lines.push(`Your advantage: ${scenarioAdvantage(c)}`, '')
    }
    lines.push('')
  }
  return lines.join('\n').trim()
})

function unwrapEnvelope(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (o.data && typeof o.data === 'object') {
    return o.data as Record<string, unknown>
  }
  return o
}

function phaseText(p: CallScriptPhase): string {
  return (
    p.script
    ?? p.content
    ?? [p.objective, ...(p.talking_points ?? [])].filter(Boolean).join('\n')
    ?? ''
  )
}

const callScriptPlain = computed(() => {
  return callPhases.value
    .map((p, i) => {
      const title = p.title ?? p.name ?? `Phase ${i + 1}`
      return `## ${title}\n\n${phaseText(p)}`
    })
    .join('\n\n')
})

const followUpPlain = computed(() => {
  const raw = unwrapEnvelope(followUpRaw.value)
  if (!raw) return ''
  const body = raw.body ?? raw.email ?? raw.text ?? raw.content
  if (typeof body === 'string') return body
  return JSON.stringify(raw, null, 2)
})

watch(
  () => [props.visible, props.initialTab] as const,
  ([v, t]) => {
    if (v) {
      tab.value = t
    }
  },
)

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      error.value = null
      briefingShareUrl.value = null
      briefingSpaUrl.value = null
    }
    if (typeof document === 'undefined') {
      return
    }
    const { documentElement: html, body } = document
    if (v) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
    }
    else {
      html.style.overflow = ''
      body.style.overflow = ''
    }
  },
)

async function runGenerate(fn: (b: PresalesToolContext) => Promise<unknown>) {
  const b = toolBody.value
  if (!b.job_post?.trim()) {
    ElMessage.warning('Missing job context')
    return
  }
  loading.value = true
  error.value = null
  try {
    await fn(b)
  }
  catch (e) {
    error.value = formatApiError(e)
    ElMessage.error(error.value)
  }
  finally {
    loading.value = false
  }
}

async function loadCallScript() {
  await runGenerate(async (b) => {
    const raw = await generateCallScript(b)
    assertGeneratorSuccess(raw)
    callRaw.value = raw
  })
}

async function loadObjections() {
  await runGenerate(async (b) => {
    const raw = await generateObjections(b)
    assertGeneratorSuccess(raw)
    objectionsRaw.value = raw
  })
}

async function loadCompetitors() {
  await runGenerate(async (b) => {
    const raw = await generateCompetitors(b)
    assertGeneratorSuccess(raw)
    competitorsRaw.value = raw
  })
}

async function loadFollowUp() {
  if (!discussed.value.trim() || !nextStep.value.trim()) {
    ElMessage.warning('Fill in what was discussed and the agreed next step.')
    return
  }
  loading.value = true
  error.value = null
  try {
    const raw = await generateFollowUpEmail({
      discussed_summary: discussed.value.trim(),
      next_step: nextStep.value.trim(),
      red_flags: redFlags.value.trim() || undefined,
      client_name: clientName.value.trim() || undefined,
      job_post: props.jobPost,
      synthesis_report: props.report,
    })
    assertGeneratorSuccess(raw)
    followUpRaw.value = raw
  }
  catch (e) {
    error.value = formatApiError(e)
    ElMessage.error(error.value)
  }
  finally {
    loading.value = false
  }
}

async function loadBriefing() {
  if (!auth.isAuthenticated) {
    ElMessage.info('Sign in to create a shareable client briefing link.')
    return
  }
  loading.value = true
  error.value = null
  try {
    const res = await createClientBriefing(toolBody.value)
    const path = res.share?.path
    if (typeof path === 'string' && path.length > 0) {
      briefingShareUrl.value = sharePathToBriefingApiUrl(path)
      briefingSpaUrl.value = sharePathToBriefingSpaUrl(path)
    }
    else {
      briefingShareUrl.value = null
      briefingSpaUrl.value = null
      ElMessage.warning('Briefing created but no share path returned.')
    }
    if (briefingShareUrl.value) {
      ElMessage.success('Briefing link ready')
    }
  }
  catch (e) {
    error.value = formatApiError(e)
    ElMessage.error(error.value)
  }
  finally {
    loading.value = false
  }
}

const fullscreenCall = ref(false)

function toggleFullscreen() {
  const el = document.querySelector('.tools-drawer__call-panel')
  if (!el) return
  if (!document.fullscreenElement) {
    void el.requestFullscreen?.()
    fullscreenCall.value = true
  }
  else {
    void document.exitFullscreen?.()
    fullscreenCall.value = false
  }
}

function objectionResponse(o: ObjectionPair): string {
  return o.response ?? o.rebuttal ?? ''
}

function compTitle(c: Record<string, unknown>): string {
  const t
    = c.competitor_archetype
      ?? c.name
      ?? c.archetype
      ?? c.title
  return typeof t === 'string' ? t : 'Alternative'
}

function scenarioOneLiner(c: Record<string, unknown>): string {
  const line = c.one_liner ?? c.oneLiner ?? c.positioning
  return typeof line === 'string' ? line : ''
}

function scenarioLikelyWhen(c: Record<string, unknown>): string {
  return typeof c.likely_when === 'string' ? c.likely_when : ''
}

function scenarioAdvantage(c: Record<string, unknown>): string {
  return typeof c.your_advantage === 'string' ? c.your_advantage : ''
}

function scenarioFullCopy(c: Record<string, unknown>): string {
  const parts: string[] = [compTitle(c)]
  const pitch = scenarioOneLiner(c)
  if (pitch) {
    parts.push('', pitch)
  }
  const when = scenarioLikelyWhen(c)
  if (when) {
    parts.push('', `Likely when: ${when}`)
  }
  const adv = scenarioAdvantage(c)
  if (adv) {
    parts.push('', `Your advantage: ${adv}`)
  }
  return parts.join('\n')
}

async function copyShareLink() {
  if (!briefingShareUrl.value) return
  await navigator.clipboard.writeText(briefingShareUrl.value)
  ElMessage.success('Copied')
}

async function copySpaLink() {
  if (!briefingSpaUrl.value) return
  await navigator.clipboard.writeText(briefingSpaUrl.value)
  ElMessage.success('Copied')
}

function openShareTab() {
  const url = briefingSpaUrl.value ?? briefingShareUrl.value
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function handleBackdrop() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div
        v-if="visible"
        class="drawer-backdrop"
        @click="handleBackdrop"
      />
    </Transition>
    <Transition name="drawer-slide">
      <div
        v-if="visible"
        class="tools-drawer tools-drawer--command proposal-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tools-drawer-title"
        @click.stop
      >
        <div class="tools-shell">
          <aside
            class="tools-rail"
            role="tablist"
            aria-label="Call kit sections"
          >
            <button
              v-for="item in railItems"
              :key="item.id"
              type="button"
              role="tab"
              :aria-selected="tab === item.id"
              class="tools-rail__btn"
              :class="{ 'tools-rail__btn--active': tab === item.id }"
              @click="tab = item.id"
            >
              <span class="tools-rail__label">{{ item.label }}</span>
              <span class="tools-rail__hint">{{ item.hint }}</span>
            </button>
          </aside>

          <div class="tools-main">
            <header class="tools-main__head">
              <div class="tools-main__head-text">
                <span class="ui-kicker">Live assets</span>
                <h2
                  id="tools-drawer-title"
                  class="tools-main__title"
                >
                  Call kit
                </h2>
                <p class="tools-main__sub">
                  Scripts, comebacks, competitive angles, and follow-ups — all grounded in this report.
                </p>
              </div>
              <button
                type="button"
                class="drawer-close tools-main__close"
                aria-label="Close"
                @click="emit('close')"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </header>

            <div
              class="tools-body tools-body--kit"
              aria-live="polite"
            >
              <p
                v-if="error"
                class="tools-error"
                role="alert"
              >
                {{ error }}
              </p>

              <!-- Call script — conversation cockpit -->
              <div
                v-show="tab === 'call'"
                class="tools-drawer__call-panel tools-panel tools-panel--cockpit"
              >
                <div class="tools-toolbar tools-toolbar--sticky">
                  <div class="tools-toolbar__primary">
                    <button
                      type="button"
                      class="tools-btn tools-btn--primary"
                      :disabled="loading"
                      @click="loadCallScript"
                    >
                      {{ callPhases.length ? 'Regenerate script' : 'Generate script' }}
                    </button>
                    <CopyButton
                      v-if="callScriptPlain"
                      :text="callScriptPlain"
                      aria-label="Copy full call script"
                    />
                  </div>
                  <div
                    class="tools-timer tools-timer--cockpit"
                    aria-label="Elapsed time"
                  >
                    <span class="tools-timer__label">{{ elapsedLabel }}</span>
                    <button
                      type="button"
                      class="tools-btn"
                      @click="timerRunning ? pauseTimer() : startTimer()"
                    >
                      {{ timerRunning ? 'Pause' : 'Start' }}
                    </button>
                    <button
                      type="button"
                      class="tools-btn"
                      @click="resetTimer"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      class="tools-btn"
                      @click="toggleFullscreen"
                    >
                      Focus mode
                    </button>
                  </div>
                </div>
                <BrandLoader
                  v-if="loading && tab === 'call'"
                  size="sm"
                />
                <ol
                  v-else
                  class="tools-timeline"
                >
                  <li
                    v-for="(phase, i) in callPhases"
                    :key="i"
                    class="tools-timeline__item"
                  >
                    <div class="tools-timeline__rail">
                      <span class="tools-timeline__step-num">{{ String(i + 1).padStart(2, '0') }}</span>
                      <span
                        v-if="hasCallDurations && phaseTimelineMeta[i]"
                        class="tools-timeline__window"
                      >
                        {{ phaseTimelineMeta[i].startMin }}–{{ phaseTimelineMeta[i].endMin }} min
                      </span>
                      <span
                        v-else-if="phase.duration_minutes ?? phase.minutes"
                        class="tools-timeline__window"
                      >
                        ~{{ phase.duration_minutes ?? phase.minutes }} min
                      </span>
                    </div>
                    <div class="tools-timeline__card">
                      <div class="tools-phase__head">
                        <span class="tools-phase__title">{{ phase.title ?? phase.name ?? `Block ${i + 1}` }}</span>
                        <CopyButton
                          :text="phaseText(phase)"
                          aria-label="Copy this block"
                        />
                      </div>
                      <p
                        v-if="phase.objective && typeof phase.objective === 'string' && (phase.script || phase.content)"
                        class="tools-phase__objective"
                      >
                        <span class="tools-phase__objective-label">Objective</span>
                        {{ phase.objective }}
                      </p>
                      <pre class="tools-phase__text">{{ phaseText(phase) }}</pre>
                    </div>
                  </li>
                </ol>
                <p
                  v-if="!loading && !callPhases.length"
                  class="tools-empty"
                >
                  <span class="tools-empty__title">No script yet</span>
                  <span class="tools-empty__body">Generate a timed flow: opening, discovery, positioning, and next step — tuned to this report.</span>
                </p>
              </div>

              <!-- Objections — tactical response cards -->
              <div
                v-show="tab === 'objections'"
                class="tools-panel tools-panel--objections"
              >
                <div class="tools-toolbar">
                  <button
                    type="button"
                    class="tools-btn tools-btn--primary"
                    :disabled="loading"
                    @click="loadObjections"
                  >
                    {{ objectionPairs.length ? 'Regenerate' : 'Generate responses' }}
                  </button>
                  <p class="tools-panel__lede">
                    Scan the objection, deliver the response with confidence.
                  </p>
                </div>
                <BrandLoader
                  v-if="loading && tab === 'objections'"
                  size="sm"
                />
                <div
                  v-else
                  class="tools-objection-grid"
                >
                  <article
                    v-for="(o, i) in objectionPairs"
                    :key="i"
                    class="tools-objection"
                  >
                    <header class="tools-objection__header">
                      <span class="tools-objection__index">{{ String(i + 1).padStart(2, '0') }}</span>
                      <h3 class="tools-objection__title">
                        {{ o.objection ?? 'Objection' }}
                      </h3>
                    </header>
                    <p
                      v-if="o.technique"
                      class="tools-objection__technique"
                    >
                      <span class="tools-objection__tag">Technique</span>
                      {{ o.technique }}
                    </p>
                    <div class="tools-objection__response">
                      <span class="tools-objection__tag tools-objection__tag--accent">Your line</span>
                      <p class="tools-objection__body">
                        {{ objectionResponse(o) }}
                      </p>
                      <CopyButton
                        :text="objectionResponse(o)"
                        variant="inline"
                        label="Copy response"
                        aria-label="Copy response"
                      />
                    </div>
                  </article>
                </div>
                <p
                  v-if="!loading && !objectionPairs.length"
                  class="tools-empty"
                >
                  <span class="tools-empty__title">No objections yet</span>
                  <span class="tools-empty__body">Generate likely pushback and concise replies you can read in seconds on the call.</span>
                </p>
              </div>

              <!-- Competitors -->
              <div
                v-show="tab === 'competitors'"
                class="tools-panel"
              >
                <div class="tools-toolbar">
                  <button
                    type="button"
                    class="tools-btn tools-btn--primary"
                    :disabled="loading"
                    @click="loadCompetitors"
                  >
                    {{ competitorItems.length ? 'Regenerate' : 'Generate' }}
                  </button>
                  <CopyButton
                    v-if="competitorItems.length"
                    :text="competitorsPlainAll"
                    aria-label="Copy all competitor scenarios"
                  />
                </div>
                <BrandLoader
                  v-if="loading && tab === 'competitors'"
                  size="sm"
                />
                <template v-else>
                  <div
                    v-if="competitorItems.length"
                    class="tools-comp-wrap"
                  >
                    <div
                      v-if="competitorsClientTypeLabel"
                      class="tools-comp-ribbon"
                      role="status"
                    >
                      <span class="tools-comp-ribbon__label">Buyer lens</span>
                      <span class="tools-comp-ribbon__value">{{ competitorsClientTypeLabel }}</span>
                    </div>
                    <ul
                      class="tools-comp-list tools-comp-list--rich"
                      role="list"
                    >
                      <li
                        v-for="(c, i) in competitorItems"
                        :key="i"
                        class="tools-comp tools-comp--rich"
                        role="listitem"
                      >
                        <div class="tools-comp__top">
                          <span class="tools-comp__index">{{ String(i + 1).padStart(2, '0') }}</span>
                          <h3 class="tools-comp__title">
                            {{ compTitle(c) }}
                          </h3>
                          <CopyButton
                            class="tools-comp__copy"
                            :text="scenarioFullCopy(c)"
                            aria-label="Copy this scenario"
                          />
                        </div>
                        <p
                          v-if="scenarioOneLiner(c)"
                          class="tools-comp__pitch"
                        >
                          {{ scenarioOneLiner(c) }}
                        </p>
                        <div
                          v-if="scenarioLikelyWhen(c) || scenarioAdvantage(c)"
                          class="tools-comp__split"
                        >
                          <div
                            v-if="scenarioLikelyWhen(c)"
                            class="tools-comp__block"
                          >
                            <span class="tools-comp__block-label">Likely when</span>
                            <p class="tools-comp__block-text">
                              {{ scenarioLikelyWhen(c) }}
                            </p>
                          </div>
                          <div
                            v-if="scenarioAdvantage(c)"
                            class="tools-comp__block tools-comp__block--edge"
                          >
                            <span class="tools-comp__block-label">Your edge</span>
                            <p class="tools-comp__block-text">
                              {{ scenarioAdvantage(c) }}
                            </p>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <p
                    v-else
                    class="tools-hint"
                  >
                    See how other choices (freelancers, agencies, in-house, DIY) might look to the buyer — and how you win.
                  </p>
                </template>
              </div>

              <!-- Follow-up — structured inputs + preview -->
              <div
                v-show="tab === 'followup'"
                class="tools-panel tools-panel--followup"
              >
                <div class="tools-followup-grid">
                  <div class="tools-followup-form">
                    <p class="tools-panel__lede tools-panel__lede--tight">
                      Capture the call, then generate a crisp follow-up your client can act on.
                    </p>
                    <label class="tools-field">
                      <span>What you discussed</span>
                      <textarea
                        v-model="discussed"
                        rows="3"
                        class="tools-textarea"
                        placeholder="Decisions, scope, concerns, numbers…"
                      />
                    </label>
                    <label class="tools-field">
                      <span>Agreed next step</span>
                      <textarea
                        v-model="nextStep"
                        rows="2"
                        class="tools-textarea"
                        placeholder="e.g. Proposal by Friday, intro to stakeholder…"
                      />
                    </label>
                    <label class="tools-field">
                      <span>Open risks (optional)</span>
                      <textarea
                        v-model="redFlags"
                        rows="2"
                        class="tools-textarea"
                        placeholder="Budget, timing, competing priorities…"
                      />
                    </label>
                    <label class="tools-field">
                      <span>Client name (optional)</span>
                      <input
                        v-model="clientName"
                        type="text"
                        class="tools-input"
                        placeholder="Used in greeting"
                      >
                    </label>
                    <div class="tools-toolbar tools-toolbar--compact">
                      <button
                        type="button"
                        class="tools-btn tools-btn--primary"
                        :disabled="loading"
                        @click="loadFollowUp"
                      >
                        Generate draft
                      </button>
                      <CopyButton
                        v-if="followUpPlain"
                        :text="followUpPlain"
                        aria-label="Copy follow-up email"
                      />
                    </div>
                  </div>
                  <div class="tools-email-shell">
                    <div class="tools-email-shell__chrome">
                      <span class="tools-email-shell__dot" />
                      <span class="tools-email-shell__dot" />
                      <span class="tools-email-shell__dot" />
                      <span class="tools-email-shell__title">Draft preview</span>
                    </div>
                    <BrandLoader
                      v-if="loading && tab === 'followup'"
                      size="sm"
                    />
                    <div
                      v-else-if="followUpPlain"
                      class="tools-email-shell__body"
                    >
                      <pre class="tools-pre tools-pre--email">{{ followUpPlain }}</pre>
                    </div>
                    <p
                      v-else
                      class="tools-email-shell__placeholder"
                    >
                      Your generated email appears here — structured, professional, ready to paste.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Briefing — client-facing share -->
              <div
                v-show="tab === 'briefing'"
                class="tools-panel tools-panel--briefing"
              >
                <div class="tools-briefing-card">
                  <p class="tools-briefing-card__title">
                    Share a client-facing page
                  </p>
                  <p class="tools-briefing-card__body">
                    A polished, read-only brief your client can open in the browser — no wall of AI text.
                    Uses your configured API host (<code class="tools-inline-code">VITE_API_URL</code>), not the Vite dev port.
                  </p>
                  <ol class="tools-briefing-steps">
                    <li>
                      <span class="tools-briefing-steps__num">1</span>
                      Create the link from this analysis
                    </li>
                    <li>
                      <span class="tools-briefing-steps__num">2</span>
                      Share the app URL with your client
                    </li>
                    <li>
                      <span class="tools-briefing-steps__num">3</span>
                      They see a polished brief — no raw AI clutter
                    </li>
                  </ol>
                  <button
                    type="button"
                    class="tools-btn tools-btn--primary tools-btn--block"
                    :disabled="loading || !auth.isAuthenticated"
                    @click="loadBriefing"
                  >
                    {{ briefingShareUrl ? 'Refresh briefing link' : 'Create briefing link' }}
                  </button>
                  <p
                    v-if="!auth.isAuthenticated"
                    class="tools-briefing-card__note"
                  >
                    Sign in to generate a shareable link.
                  </p>
                </div>
                <div
                  v-if="briefingShareUrl"
                  class="tools-share tools-share--elevated"
                >
                  <p class="tools-share__label">
                    API permalink
                  </p>
                  <code class="tools-share__url">{{ briefingShareUrl }}</code>
                  <p
                    v-if="briefingSpaUrl"
                    class="tools-share__spa"
                  >
                    Readable page:
                    <code class="tools-share__url tools-share__url--secondary">{{ briefingSpaUrl }}</code>
                  </p>
                  <div class="tools-share__actions">
                    <button
                      type="button"
                      class="tools-btn"
                      @click="copyShareLink"
                    >
                      Copy API link
                    </button>
                    <button
                      v-if="briefingSpaUrl"
                      type="button"
                      class="tools-btn"
                      @click="copySpaLink"
                    >
                      Copy app link
                    </button>
                    <button
                      type="button"
                      class="tools-btn tools-btn--primary"
                      @click="openShareTab"
                    >
                      Open in app
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped src="@/assets/styles/proposal-drawer.css"></style>

<style scoped>
.tools-drawer.tools-drawer--command {
  width: min(1024px, 100vw);
  background: var(--bg-surface);
}

.tools-shell {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  height: 100%;
}

.tools-rail {
  width: 168px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  border-right: 1px solid rgba(0, 230, 118, 0.12);
  background: linear-gradient(180deg, rgba(10, 14, 12, 0.98), rgba(8, 11, 10, 0.98));
  overflow-y: auto;
  scrollbar-color: rgba(0, 230, 118, 0.35) rgba(0, 0, 0, 0.35);
}

.tools-rail__btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: var(--space-3) var(--space-3);
  border: 1px solid rgba(0, 230, 118, 0.1);
  border-radius: 12px;
  background: rgba(0, 230, 118, 0.03);
  color: var(--text-secondary);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.tools-rail__btn:hover {
  color: var(--text-primary);
  border-color: rgba(0, 230, 118, 0.35);
  background: rgba(0, 230, 118, 0.08);
}

.tools-rail__btn--active {
  color: var(--accent-primary);
  border-color: rgba(0, 230, 118, 0.45);
  background: rgba(0, 230, 118, 0.1);
  box-shadow: 0 0 24px rgba(0, 230, 118, 0.08);
}

.tools-rail__btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.tools-rail__label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.tools-rail__hint {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tools-rail__btn--active .tools-rail__hint {
  color: rgba(0, 230, 118, 0.75);
}

.tools-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tools-main__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(0, 230, 118, 0.1);
  background: linear-gradient(
    180deg,
    rgba(22, 29, 23, 0.98) 0%,
    var(--bg-elevated) 100%
  );
  flex-shrink: 0;
}

.tools-main__head-text {
  min-width: 0;
}

.tools-main__title {
  margin: var(--space-1) 0 var(--space-2);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  line-height: 1.25;
}

.tools-main__sub {
  margin: 0;
  max-width: 36rem;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}

.tools-main__close {
  flex-shrink: 0;
}

.tools-body--kit {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-5);
  scrollbar-gutter: stable;
  scrollbar-color: rgba(0, 230, 118, 0.35) rgba(0, 0, 0, 0.35);
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 48%);
}

.tools-body--kit::-webkit-scrollbar {
  width: 8px;
}

.tools-body--kit::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

.tools-body--kit::-webkit-scrollbar-thumb {
  background: rgba(0, 230, 118, 0.28);
  border-radius: 4px;
}

@media (max-width: 700px) {
  .tools-shell {
    flex-direction: column;
  }

  .tools-rail {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    border-right: none;
    border-bottom: 1px solid rgba(0, 230, 118, 0.12);
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
    flex-wrap: nowrap;
  }

  .tools-rail__btn {
    flex: 0 0 auto;
    min-width: 112px;
  }
}

.tools-error {
  margin: 0 0 var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(248, 113, 113, 0.12);
  color: #fecaca;
  font-size: 13px;
}

.tools-panel {
  max-width: 100%;
}

.tools-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.tools-toolbar--sticky {
  position: sticky;
  top: 0;
  z-index: 2;
  margin: calc(-1 * var(--space-5)) calc(-1 * var(--space-5)) var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: rgba(8, 11, 10, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-subtle);
}

.tools-toolbar__primary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.tools-toolbar--compact {
  margin-bottom: 0;
}

.tools-panel__lede {
  margin: 0;
  flex: 1 1 200px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-muted);
  font-weight: 500;
}

.tools-panel__lede--tight {
  flex: none;
  width: 100%;
  margin-bottom: var(--space-2);
}

.tools-panel--cockpit {
  margin: calc(-1 * var(--space-1)) 0 0;
}

.tools-timer--cockpit {
  margin-left: auto;
}

@media (max-width: 560px) {
  .tools-timer--cockpit {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
  }
}

.tools-btn {
  cursor: pointer;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  padding: var(--space-2) var(--space-4);
}

.tools-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.tools-btn--primary {
  background: var(--gradient-brand);
  border: none;
  color: var(--text-inverse);
}

.tools-btn--primary:hover {
  filter: brightness(1.05);
}

.tools-btn--block {
  width: 100%;
  justify-content: center;
}

.tools-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.tools-timer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
  flex-wrap: wrap;
}

.tools-timer__label {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--accent-primary);
  min-width: 52px;
}

.tools-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tools-timeline__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-4);
  position: relative;
  padding-bottom: var(--space-6);
}

.tools-timeline__item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 15px;
  top: 36px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    180deg,
    rgba(0, 230, 118, 0.35) 0%,
    rgba(0, 230, 118, 0.08) 100%
  );
  border-radius: 1px;
}

.tools-timeline__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  min-width: 52px;
  text-align: center;
}

.tools-timeline__step-num {
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--accent-primary);
  padding: var(--space-2) var(--space-2);
  border-radius: var(--radius-sm);
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid rgba(0, 230, 118, 0.22);
  line-height: 1.2;
}

.tools-timeline__window {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  max-width: 64px;
  line-height: 1.25;
}

.tools-timeline__card {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background: linear-gradient(
    165deg,
    rgba(22, 29, 23, 0.95) 0%,
    rgba(15, 20, 16, 0.92) 100%
  );
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.05) inset,
    0 10px 28px rgba(0, 0, 0, 0.22);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.tools-timeline__card:hover {
  border-color: rgba(0, 230, 118, 0.2);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.08) inset,
    0 14px 36px rgba(0, 0, 0, 0.28);
}

.tools-phase__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.tools-phase__title {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  flex: 1;
  line-height: 1.35;
}

.tools-phase__objective {
  margin: 0 0 var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border-left: 3px solid rgba(0, 188, 212, 0.65);
  background: rgba(0, 188, 212, 0.06);
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.tools-phase__objective-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(0, 188, 212, 0.9);
  margin-bottom: var(--space-1);
}

.tools-phase__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
  font-family: var(--font-sans);
}

.tools-empty {
  margin: var(--space-6) 0 0;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-default);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-align: center;
}

.tools-empty__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.tools-empty__body {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-muted);
  max-width: 28rem;
  margin: 0 auto;
}

.tools-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.tools-objection-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tools-objection {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background: var(--bg-elevated);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.tools-objection:hover {
  border-color: rgba(0, 230, 118, 0.22);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
}

.tools-objection__header {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.tools-objection__index {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--severity-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: rgba(255, 171, 64, 0.1);
  border: 1px solid rgba(255, 171, 64, 0.25);
}

.tools-objection__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.tools-objection__technique {
  margin: 0 0 var(--space-3);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}

.tools-objection__response {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-base);
  border: 1px solid rgba(0, 230, 118, 0.15);
}

.tools-objection__body {
  margin: var(--space-2) 0 var(--space-3);
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.tools-objection__tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tools-objection__tag--accent {
  color: var(--accent-primary);
}

@media (prefers-reduced-motion: reduce) {
  .tools-timeline__card,
  .tools-objection {
    transition: none;
  }
}

.tools-comp-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tools-comp-ribbon {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.22);
  background: linear-gradient(
    135deg,
    rgba(0, 230, 118, 0.09) 0%,
    rgba(0, 137, 123, 0.05) 100%
  );
}

.tools-comp-ribbon__label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.tools-comp-ribbon__value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.tools-comp-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tools-comp-list--rich {
  gap: var(--space-4);
}

.tools-comp {
  position: relative;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  background: linear-gradient(
    165deg,
    rgba(22, 29, 23, 0.98) 0%,
    rgba(15, 20, 16, 0.95) 100%
  );
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.04) inset,
    0 12px 32px rgba(0, 0, 0, 0.25);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.tools-comp--rich:hover {
  border-color: rgba(0, 230, 118, 0.2);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.08) inset,
    0 16px 40px rgba(0, 0, 0, 0.32);
}

.tools-comp__top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.tools-comp__index {
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--accent-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid rgba(0, 230, 118, 0.2);
  line-height: 1.2;
}

.tools-comp__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary);
}

.tools-comp__copy {
  align-self: start;
}

.tools-comp__pitch {
  margin: 0 0 var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-primary);
  background: rgba(0, 230, 118, 0.06);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.tools-comp__split {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 520px) {
  .tools-comp__split {
    grid-template-columns: 1fr 1fr;
  }
}

.tools-comp__block {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
}

.tools-comp__block--edge {
  border-color: rgba(0, 230, 118, 0.18);
  background: rgba(0, 230, 118, 0.04);
}

.tools-comp__block-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.tools-comp__block--edge .tools-comp__block-label {
  color: var(--accent-primary);
}

.tools-comp__block-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .tools-comp--rich {
    transition: none;
  }
}

.tools-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.tools-textarea,
.tools-input {
  font-family: inherit;
  font-size: 14px;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-primary);
  resize: vertical;
}

.tools-textarea:focus-visible,
.tools-input:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 1px;
}

.tools-pre {
  margin: var(--space-4) 0 0;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.tools-pre--email {
  margin: 0;
  min-height: 12rem;
  max-height: min(50vh, 420px);
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
}

.tools-followup-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}

@media (min-width: 640px) {
  .tools-followup-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
}

.tools-email-shell {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
}

.tools-email-shell__chrome {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid var(--border-subtle);
}

.tools-email-shell__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-strong);
}

.tools-email-shell__dot:nth-child(1) {
  background: #ff5f57;
}

.tools-email-shell__dot:nth-child(2) {
  background: #febc2e;
}

.tools-email-shell__dot:nth-child(3) {
  background: #28c840;
}

.tools-email-shell__title {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tools-email-shell__body {
  padding: var(--space-4);
}

.tools-email-shell__placeholder {
  margin: 0;
  padding: var(--space-8) var(--space-4);
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-muted);
  text-align: center;
}

.tools-briefing-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: linear-gradient(
    160deg,
    rgba(22, 29, 23, 0.9) 0%,
    rgba(12, 16, 14, 0.95) 100%
  );
  margin-bottom: var(--space-4);
}

.tools-briefing-card__title {
  margin: 0 0 var(--space-2);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.tools-briefing-card__body {
  margin: 0 0 var(--space-4);
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-muted);
}

.tools-briefing-card__note {
  margin: var(--space-3) 0 0;
  font-size: 12px;
  color: var(--severity-medium);
}

.tools-briefing-steps {
  margin: 0 0 var(--space-5);
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.tools-briefing-steps li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-secondary);
}

.tools-briefing-steps__num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: var(--accent-primary);
  background: rgba(0, 230, 118, 0.12);
  border: 1px solid rgba(0, 230, 118, 0.25);
}

.tools-share {
  margin-top: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-border);
  background: var(--accent-subtle);
}

.tools-share--elevated {
  border-color: rgba(0, 230, 118, 0.28);
  background: linear-gradient(
    165deg,
    rgba(0, 230, 118, 0.1) 0%,
    rgba(0, 137, 123, 0.05) 100%
  );
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.tools-inline-code {
  font-size: 11px;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
}

.tools-share__label {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tools-share__url {
  display: block;
  font-size: 12px;
  word-break: break-all;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}

.tools-share__url--secondary {
  margin-top: var(--space-2);
  margin-bottom: 0;
}

.tools-share__spa {
  margin: 0 0 var(--space-3);
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-muted);
}

.tools-share__actions {
  display: flex;
  gap: var(--space-2);
}
</style>
