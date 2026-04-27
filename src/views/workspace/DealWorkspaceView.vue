<script setup lang="ts">
import CopyButton from '@/components/ui/CopyButton.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { isEngineOk, useDealWorkspace } from '@/composables/useDealWorkspace'
import { extractDealHeadline, groupDiscoveryQuestions } from '@/domain/deal/ui-model'
import { routeNames } from '@/router/route-names-registry'
import { computed, ref, unref } from 'vue'

const {
  jobPost,
  clientMessages,
  teamExpertise,
  constraints,
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
} = useDealWorkspace()

const liveTranscript = ref('')

const activeDeal = computed(() => lastAnalyze.value?.deal ?? insightsQuery.data.value?.deal)

const headline = computed(() => extractDealHeadline(activeDeal.value))

const insightsText = computed(() => {
  const raw = insightsQuery.data.value?.insights ?? lastAnalyze.value?.insights
  if (raw == null) {
    return ''
  }
  try {
    return JSON.stringify(raw, null, 2)
  }
  catch {
    try {
      return JSON.stringify(raw)
    }
    catch {
      return raw !== null && typeof raw === 'object' ? '[unserializable]' : String(raw as string | number | boolean)
    }
  }
})

const pipelineText = computed(() => {
  const raw = lastAnalyze.value?.pipeline
  if (raw == null) {
    return ''
  }
  try {
    return JSON.stringify(raw, null, 2)
  }
  catch {
    try {
      return JSON.stringify(raw)
    }
    catch {
      return raw !== null && typeof raw === 'object' ? '[unserializable]' : String(raw as string | number | boolean)
    }
  }
})

function fmt(u: unknown) {
  try {
    return JSON.stringify(u, null, 2)
  }
  catch {
    if (u !== null && typeof u === 'object') {
      try {
        return JSON.stringify(u)
      }
      catch {
        return '[unserializable]'
      }
    }
    return String(u as string | number | boolean | bigint)
  }
}

const questionGroups = computed(() => {
  const d = questionsMut.data.value?.data
  if (!d) {
    return []
  }
  return groupDiscoveryQuestions(d)
})

async function onRunQuestions() {
  try {
    await questionsMut.mutateAsync()
  }
  catch {
    /* surfaced via isError */
  }
}

async function onRunSolution() {
  try {
    await solutionMut.mutateAsync()
  }
  catch {
    /* surfaced via isError */
  }
}

async function onRunRisks() {
  try {
    await risksMut.mutateAsync()
  }
  catch {
    /* surfaced via isError */
  }
}

async function onLiveAssist() {
  try {
    await liveAssistMut.mutateAsync(liveTranscript.value)
  }
  catch {
    /* surfaced via isError */
  }
}

/** Unwrap mutation/query refs for template (vue-tsc + TanStack Query). */
const analyzePending = computed(() => unref(analyzeMut.isPending))
const analyzeErr = computed(() => unref(analyzeMut.isError))
const insightsPending = computed(() => unref(insightsQuery.isPending))
const insightsErr = computed(() => unref(insightsQuery.isError))
const insightsFetching = computed(() => unref(insightsQuery.isFetching))
const questionsPending = computed(() => unref(questionsMut.isPending))
const questionsErr = computed(() => unref(questionsMut.isError))
const questionsPayload = computed(() => unref(questionsMut.data))
const solutionPending = computed(() => unref(solutionMut.isPending))
const solutionErr = computed(() => unref(solutionMut.isError))
const solutionPayload = computed(() => unref(solutionMut.data))
const risksPending = computed(() => unref(risksMut.isPending))
const risksErr = computed(() => unref(risksMut.isError))
const risksPayload = computed(() => unref(risksMut.data))
const livePending = computed(() => unref(liveAssistMut.isPending))
const liveErr = computed(() => unref(liveAssistMut.isError))
const livePayload = computed(() => unref(liveAssistMut.data))
const memRecentPending = computed(() => unref(memoryRecentQuery.isPending))
const memRecentErr = computed(() => unref(memoryRecentQuery.isError))
const memRecentData = computed(() => unref(memoryRecentQuery.data))
const memSimPending = computed(() => unref(memorySimilarQuery.isPending))
const memSimErr = computed(() => unref(memorySimilarQuery.isError))
const memSimData = computed(() => unref(memorySimilarQuery.data))

const analyzeError = computed(() => unref(analyzeMut.error))
const insightsError = computed(() => unref(insightsQuery.error))
const questionsError = computed(() => unref(questionsMut.error))
const solutionError = computed(() => unref(solutionMut.error))
const risksError = computed(() => unref(risksMut.error))
const liveError = computed(() => unref(liveAssistMut.error))
const memRecentError = computed(() => unref(memoryRecentQuery.error))
const memSimError = computed(() => unref(memorySimilarQuery.error))
</script>

<template>
  <div class="dw">
    <header class="dw__hero">
      <p class="dw__kicker">
        PreSalesAI
      </p>
      <h1 class="dw__title">
        Deal workspace
      </h1>
      <p class="dw__lede">
        Run the deal engine, refresh structured insights, then spin up discovery questions, solution variants, and risk lenses — without dumping raw model text.
      </p>
      <div class="dw__links">
        <RouterLink
          :to="{ name: routeNames.liveAssist }"
          class="dw__link"
        >
          Open live call mode →
        </RouterLink>
        <RouterLink
          :to="{ name: routeNames.analyze }"
          class="dw__link dw__link--ghost"
        >
          Classic capture
        </RouterLink>
      </div>
    </header>

    <div class="dw__grid">
      <!-- LEFT: inputs -->
      <section
        class="dw__panel dw__panel--in"
        aria-label="Deal inputs"
      >
        <h2 class="dw__h">
          Context
        </h2>
        <label class="dw__field">
          <span class="dw__label">Job post <span class="dw__req">*</span></span>
          <textarea
            v-model="jobPost"
            class="dw__textarea"
            rows="8"
            placeholder="Paste the role, requirements, constraints from the posting…"
          />
        </label>
        <label class="dw__field">
          <span class="dw__label">Client messages</span>
          <textarea
            v-model="clientMessages"
            class="dw__textarea dw__textarea--sm"
            rows="3"
            placeholder="Emails, Slack, notes from the prospect…"
          />
        </label>
        <label class="dw__field">
          <span class="dw__label">Team expertise</span>
          <textarea
            v-model="teamExpertise"
            class="dw__textarea dw__textarea--sm"
            rows="2"
            placeholder="What we’re strong at (optional)"
          />
        </label>
        <label class="dw__field">
          <span class="dw__label">Constraints</span>
          <textarea
            v-model="constraints"
            class="dw__textarea dw__textarea--sm"
            rows="2"
            placeholder="Budget, timeline, compliance…"
          />
        </label>

        <button
          type="button"
          class="dw__btn dw__btn--primary"
          :disabled="analyzePending || !jobPost.trim()"
          @click="runAnalyze"
        >
          <span v-if="analyzePending">Analyzing…</span>
          <span v-else>Run deal analysis</span>
        </button>
        <p
          v-if="analyzeErr"
          class="dw__err"
        >
          {{ formatApiError(analyzeError) }}
        </p>
      </section>

      <!-- CENTER: thinking -->
      <section
        class="dw__panel dw__panel--core"
        aria-label="Thinking system"
      >
        <div class="dw__core-head">
          <h2 class="dw__h">
            {{ headline }}
          </h2>
          <div
            v-if="dealId"
            class="dw__id-row"
          >
            <code class="dw__id">deal id: {{ dealId }}</code>
            <CopyButton
              :text="dealId"
              aria-label="Copy deal id"
            />
          </div>
        </div>

        <label class="dw__toggle">
          <input
            v-model="pollInsights"
            type="checkbox"
          >
          <span>Auto-refresh insights (GET)</span>
        </label>

        <div
          v-if="insightsPending"
          class="dw__loader"
          aria-busy="true"
        >
          <BrandLoader size="sm" />
        </div>
        <p
          v-else-if="insightsErr"
          class="dw__err"
        >
          {{ formatApiError(insightsError) }}
        </p>

        <details
          v-if="insightsText"
          class="dw__details"
          open
        >
          <summary class="dw__summary">
            Structured insights
            <CopyButton
              :text="insightsText"
              aria-label="Copy insights JSON"
            />
          </summary>
          <pre class="dw__pre">{{ insightsText }}</pre>
        </details>

        <details
          v-if="pipelineText"
          class="dw__details"
        >
          <summary class="dw__summary">
            Pipeline snapshot
            <CopyButton
              :text="pipelineText"
              aria-label="Copy pipeline JSON"
            />
          </summary>
          <pre class="dw__pre">{{ pipelineText }}</pre>
        </details>

        <div
          v-if="!insightsText && !pipelineText && !analyzePending && !insightsPending"
          class="dw__empty"
        >
          <p>Run an analysis to populate deal state. Insights load from the server for the returned deal id (same process lifetime).</p>
        </div>

        <button
          type="button"
          class="dw__btn dw__btn--ghost"
          :disabled="!dealId || insightsFetching"
          @click="refreshInsights"
        >
          Refresh insights now
        </button>
      </section>

      <!-- RIGHT: engines + memory -->
      <section
        class="dw__panel dw__panel--actions"
        aria-label="Engines and memory"
      >
        <h2 class="dw__h">
          Engines
        </h2>

        <div class="dw__engine">
          <div class="dw__engine-head">
            <h3 class="dw__h3">
              Discovery questions
            </h3>
            <button
              type="button"
              class="dw__btn dw__btn--sm"
              :disabled="questionsPending || !jobPost.trim()"
              @click="onRunQuestions"
            >
              {{ questionsPending ? '…' : 'Generate' }}
            </button>
          </div>
          <p
            v-if="questionsErr"
            class="dw__err"
          >
            {{ formatApiError(questionsError) }}
          </p>
          <div
            v-else-if="questionsPayload && isEngineOk(questionsPayload)"
            class="dw__blocks"
          >
            <details
              v-for="g in questionGroups"
              :key="g.key"
              class="dw__details"
              open
            >
              <summary class="dw__summary">
                {{ g.label }}
                <CopyButton
                  :text="g.items.join('\n')"
                  aria-label="Copy questions"
                />
              </summary>
              <ul class="dw__ul">
                <li
                  v-for="(q, i) in g.items"
                  :key="`${g.key}-${i}`"
                  class="dw__li"
                >
                  {{ q }}
                </li>
              </ul>
            </details>
          </div>
          <p
            v-else-if="questionsPayload && !isEngineOk(questionsPayload)"
            class="dw__muted"
          >
            Engine returned a non-success status — check server logs.
          </p>
        </div>

        <div class="dw__engine">
          <div class="dw__engine-head">
            <h3 class="dw__h3">
              Solution variants
            </h3>
            <button
              type="button"
              class="dw__btn dw__btn--sm"
              :disabled="solutionPending || !jobPost.trim()"
              @click="onRunSolution"
            >
              {{ solutionPending ? '…' : 'Compare' }}
            </button>
          </div>
          <p
            v-if="solutionErr"
            class="dw__err"
          >
            {{ formatApiError(solutionError) }}
          </p>
          <div v-else-if="solutionPayload">
            <div class="dw__tool-row">
              <CopyButton
                :text="fmt(solutionPayload)"
                aria-label="Copy solution payload"
              />
            </div>
            <pre class="dw__pre dw__pre--tight">{{ fmt(solutionPayload) }}</pre>
          </div>
        </div>

        <div class="dw__engine">
          <div class="dw__engine-head">
            <h3 class="dw__h3">
              Risk lens
            </h3>
            <button
              type="button"
              class="dw__btn dw__btn--sm"
              :disabled="risksPending || !jobPost.trim()"
              @click="onRunRisks"
            >
              {{ risksPending ? '…' : 'Analyze' }}
            </button>
          </div>
          <p
            v-if="risksErr"
            class="dw__err"
          >
            {{ formatApiError(risksError) }}
          </p>
          <div v-else-if="risksPayload">
            <div class="dw__tool-row">
              <CopyButton
                :text="fmt(risksPayload)"
                aria-label="Copy risks payload"
              />
            </div>
            <pre class="dw__pre dw__pre--tight">{{ fmt(risksPayload) }}</pre>
          </div>
        </div>

        <h2 class="dw__h dw__h--spaced">
          Live assist (structured)
        </h2>
        <label class="dw__field">
          <span class="dw__label">Transcript snippet</span>
          <textarea
            v-model="liveTranscript"
            class="dw__textarea dw__textarea--sm"
            rows="4"
            placeholder="Paste the last few turns from the call…"
          />
        </label>
        <button
          type="button"
          class="dw__btn"
          :disabled="livePending || !liveTranscript.trim()"
          @click="onLiveAssist"
        >
          {{ livePending ? '…' : 'Assist' }}
        </button>
        <p
          v-if="liveErr"
          class="dw__err"
        >
          {{ formatApiError(liveError) }}
        </p>
        <div v-if="livePayload">
          <div class="dw__tool-row">
            <CopyButton
              :text="fmt(livePayload)"
              aria-label="Copy assist result"
            />
          </div>
          <pre class="dw__pre dw__pre--tight">{{ fmt(livePayload) }}</pre>
        </div>

        <h2 class="dw__h dw__h--spaced">
          Memory (MVP)
        </h2>
        <p class="dw__muted">
          In-memory on this server instance — resets on deploy/restart.
        </p>
        <label class="dw__field">
          <span class="dw__label">Similar deals</span>
          <input
            v-model="memoryQ"
            type="search"
            class="dw__input"
            placeholder="Search past deals…"
          >
        </label>

        <details class="dw__details">
          <summary class="dw__summary">
            Recent
            <CopyButton
              v-if="memRecentData"
              :text="fmt(memRecentData)"
              aria-label="Copy recent memory"
            />
          </summary>
          <div
            v-if="memRecentPending"
            class="dw__loader dw__loader--sm"
          >
            <BrandLoader size="sm" />
          </div>
          <p
            v-else-if="memRecentErr"
            class="dw__err"
          >
            {{ formatApiError(memRecentError) }}
          </p>
          <pre
            v-else-if="memRecentData"
            class="dw__pre dw__pre--tight"
          >{{ fmt(memRecentData) }}</pre>
          <p
            v-else
            class="dw__muted"
          >
            No data.
          </p>
        </details>

        <details class="dw__details">
          <summary class="dw__summary">
            Similar
            <CopyButton
              v-if="memSimData"
              :text="fmt(memSimData)"
              aria-label="Copy similar memory"
            />
          </summary>
          <div
            v-if="memSimPending"
            class="dw__loader dw__loader--sm"
          >
            <BrandLoader size="sm" />
          </div>
          <p
            v-else-if="memSimErr"
            class="dw__err"
          >
            {{ formatApiError(memSimError) }}
          </p>
          <pre
            v-else-if="memSimData"
            class="dw__pre dw__pre--tight"
          >{{ fmt(memSimData) }}</pre>
          <p
            v-else
            class="dw__muted"
          >
            Type at least 2 characters to search.
          </p>
        </details>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dw {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
}

.dw__hero {
  margin-bottom: clamp(1.25rem, 3vw, 2rem);
}

.dw__kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.dw__title {
  margin: 0 0 var(--space-2);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dw__lede {
  margin: 0 0 var(--space-4);
  max-width: 42rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.dw__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.dw__link {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-primary);
  text-decoration: none;
}

.dw__link:hover {
  text-decoration: underline;
}

.dw__link--ghost {
  color: var(--text-secondary);
  font-weight: 500;
}

.dw__grid {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr) minmax(280px, 360px);
  gap: var(--space-5);
  align-items: start;
}

@media (max-width: 1100px) {
  .dw__grid {
    grid-template-columns: 1fr;
  }
}

.dw__panel {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 230, 118, 0.12);
  background: rgba(8, 11, 10, 0.55);
  padding: var(--space-4);
}

.dw__panel--core {
  min-height: 420px;
}

.dw__h {
  margin: 0 0 var(--space-3);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.dw__h--spaced {
  margin-top: var(--space-5);
}

.dw__h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.dw__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.dw__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.dw__req {
  color: rgba(255, 120, 120, 0.95);
}

.dw__textarea {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.18);
  background: rgba(6, 9, 8, 0.9);
  color: var(--text-primary);
  font-family: ui-monospace, monospace;
  font-size: 13px;
  line-height: 1.45;
  resize: vertical;
  min-height: 120px;
}

.dw__textarea--sm {
  min-height: 72px;
  font-family: inherit;
}

.dw__input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.18);
  background: rgba(6, 9, 8, 0.9);
  color: var(--text-primary);
  font-size: 14px;
}

.dw__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.22);
  background: rgba(14, 18, 16, 0.95);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.dw__btn:hover:not(:disabled) {
  border-color: rgba(0, 230, 118, 0.45);
  background: rgba(0, 230, 118, 0.06);
}

.dw__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.dw__btn--primary {
  width: 100%;
  background: rgba(0, 230, 118, 0.12);
  border-color: rgba(0, 230, 118, 0.35);
  color: var(--accent-primary);
}

.dw__btn--ghost {
  margin-top: var(--space-3);
  width: 100%;
}

.dw__btn--sm {
  padding: 6px 12px;
  font-size: 12px;
}

.dw__err {
  margin: var(--space-2) 0 0;
  font-size: 13px;
  color: rgba(255, 160, 160, 0.95);
}

.dw__muted {
  margin: 0 0 var(--space-2);
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.45;
}

.dw__core-head {
  margin-bottom: var(--space-3);
}

.dw__id-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.dw__id {
  font-size: 12px;
  color: var(--text-muted);
  word-break: break-all;
}

.dw__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.dw__loader {
  display: flex;
  justify-content: center;
  padding: var(--space-4);
}

.dw__loader--sm {
  padding: var(--space-2);
}

.dw__details {
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.1);
  background: rgba(5, 8, 7, 0.65);
  padding: var(--space-2) var(--space-3);
}

.dw__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  list-style: none;
}

.dw__summary::-webkit-details-marker {
  display: none;
}

.dw__pre {
  margin: var(--space-2) 0 0;
  padding: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 280px;
  overflow: auto;
}

.dw__pre--tight {
  max-height: 200px;
  margin-top: var(--space-2);
}

.dw__empty {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px dashed rgba(0, 230, 118, 0.15);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.dw__engine {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid rgba(0, 230, 118, 0.08);
}

.dw__engine-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.dw__blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dw__ul {
  margin: var(--space-2) 0 0;
  padding-left: 1.1rem;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.45;
}

.dw__li {
  margin-bottom: var(--space-1);
}

.dw__tool-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-1);
}
</style>
