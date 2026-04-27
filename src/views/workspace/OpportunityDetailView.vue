<script setup lang="ts">
import ReportView from '@/components/ReportView.vue'
import OpportunityContextHeader from '@/components/workspace/OpportunityContextHeader.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { useReportDetail } from '@/composables/useReportDetail'
import type { CallIntent, OpportunityStage } from '@/domain/opportunity'
import { routeNames } from '@/router/route-names-registry'
import { useOpportunityMetaStore } from '@/stores/opportunity-meta.store'
import { extractPipelineRiskStrategy } from '@/utils/storedReport'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const {
  loading,
  error,
  report,
  deleting,
  synthesisReport,
  intelligence,
  analyzeContext,
  back,
  onRequestDelete,
} = useReportDetail()

const route = useRoute()
const router = useRouter()
const metaStore = useOpportunityMetaStore()

const pipelineRisk = computed(() => extractPipelineRiskStrategy(report.value?.result).risk)
const pipelineStrategy = computed(() => extractPipelineRiskStrategy(report.value?.result).strategy)

const opportunityId = computed(() => route.params.id as string)

const meta = computed(() => metaStore.getMeta(opportunityId.value))

const mode = computed<'prepare' | 'perform'>({
  get() {
    return route.query.mode === 'perform' ? 'perform' : 'prepare'
  },
  set(v) {
    void router.replace({
      name: routeNames.opportunityDetail,
      params: { id: opportunityId.value },
      query: {
        ...route.query,
        mode: v === 'perform' ? 'perform' : undefined,
      },
    })
  },
})

watch(
  opportunityId,
  (id) => {
    if (id) {
      metaStore.touchOpened(id)
    }
  },
  { immediate: true },
)

const callSoonLabel = computed(() => {
  const raw = meta.value.callAt
  if (!raw) {
    return null
  }
  const t = Date.parse(raw)
  if (Number.isNaN(t)) {
    return null
  }
  const delta = t - Date.now()
  if (delta < 0 || delta > 48 * 60 * 60 * 1000) {
    return null
  }
  const h = Math.round(delta / (60 * 60 * 1000))
  if (h <= 1) {
    return 'Call within the hour'
  }
  return `Call in ~${h}h`
})

const scratchpad = computed({
  get: () => meta.value.performScratchpad,
  set: (v: string) => metaStore.setPerformScratchpad(opportunityId.value, v),
})

const debriefNotes = computed({
  get: () => meta.value.debriefNotes,
  set: (v: string) => metaStore.setDebriefNotes(opportunityId.value, v),
})

function onStage(s: OpportunityStage) {
  metaStore.setStage(opportunityId.value, s)
}

function onCallAt(v: string | null) {
  metaStore.setCallAt(opportunityId.value, v)
}

function onIntent(v: CallIntent | null) {
  metaStore.setIntent(opportunityId.value, v)
}

function onMode(m: 'prepare' | 'perform') {
  mode.value = m
}
</script>

<template>
  <div class="opp-page">
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      class="opp-alert"
    />

    <div
      class="opp-body"
      :class="{ 'opp-body--loading': loading }"
    >
      <div
        v-if="loading"
        class="opp-loader"
        aria-busy="true"
      >
        <BrandLoader size="lg" />
      </div>

      <div
        v-else-if="synthesisReport && report"
        class="opp-stack"
      >
        <OpportunityContextHeader
          :title="report.title || 'Untitled opportunity'"
          :job-post-preview="analyzeContext.jobPost || report.job_post || null"
          :stage="meta.stage"
          :call-at="meta.callAt"
          :intent="meta.intent"
          :mode="mode"
          :call-soon-label="callSoonLabel"
          @update:stage="onStage"
          @update:call-at="onCallAt"
          @update:intent="onIntent"
          @update:mode="onMode"
        />

        <div
          v-if="mode === 'perform'"
          class="opp-perform-tools"
        >
          <label class="opp-field">
            <span class="opp-field__label">Live notes</span>
            <textarea
              v-model="scratchpad"
              class="opp-textarea"
              rows="3"
              placeholder="Jot what they say, objections, follow-ups…"
            />
          </label>
          <label class="opp-field">
            <span class="opp-field__label">After the call</span>
            <textarea
              v-model="debriefNotes"
              class="opp-textarea opp-textarea--compact"
              rows="2"
              placeholder="Outcome, surprises, next step…"
            />
          </label>
        </div>

        <ReportView
          :report="synthesisReport"
          variant="saved"
          :document-title="report.title ?? null"
          :intelligence="intelligence"
          :job-post="analyzeContext.jobPost"
          :client-messages="analyzeContext.clientMessages"
          :team-expertise="analyzeContext.teamExpertise"
          :constraints="analyzeContext.constraints"
          :pipeline-risk="pipelineRisk"
          :pipeline-strategy="pipelineStrategy"
          :saved-report-id="report.id ?? null"
          :delete-in-progress="deleting"
          :workspace-mode="mode"
          suppress-top-inset
          @leave="back"
          @request-delete="onRequestDelete"
        />
      </div>

      <div
        v-else-if="report && !loading"
        class="opp-fallback"
      >
        <div class="opp-fallback-toolbar">
          <button
            type="button"
            class="opp-btn opp-btn--ghost"
            @click="back"
          >
            Back to pipeline
          </button>
          <button
            type="button"
            class="opp-btn opp-btn--danger"
            :disabled="deleting"
            @click="onRequestDelete"
          >
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
        <p class="opp-fallback-title">
          This saved payload doesn’t include a full synthesis report.
        </p>
        <pre class="opp-fallback-pre">{{ JSON.stringify(report.result, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.opp-page {
  width: 100%;
  margin: 0 auto;
  background: var(--bg-base);
}

/**
 * Clears the fixed `.report-top` toolbar (same gaps as `.report-page` in ReportView).
 * ReportView uses `suppressTopInset` so we don’t double the offset.
 */
.opp-stack {
  --report-header-gap: calc(60px + env(safe-area-inset-top, 0px));
  padding-top: var(--report-header-gap);
}

@media (min-width: 1024px) and (max-width: 1200px) {
  .opp-stack {
    --report-header-gap: calc(104px + env(safe-area-inset-top, 0px));
  }
}

@media (min-width: 1201px) {
  .opp-stack {
    --report-header-gap: calc(60px + env(safe-area-inset-top, 0px));
  }
}

@media (max-width: 1023px) {
  .opp-stack {
    --report-header-gap: calc(56px + env(safe-area-inset-top, 0px));
  }
}

.opp-alert {
  max-width: 720px;
  margin: 0 auto var(--space-4);
}

.opp-body {
  position: relative;
  min-height: 200px;
}

.opp-body--loading {
  min-height: min(60vh, 520px);
}

.opp-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.opp-perform-tools {
  max-width: 1280px;
  margin: 0 auto var(--space-6);
  padding: 0 var(--space-4);
  display: grid;
  gap: var(--space-4);
}

.opp-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.opp-field__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.opp-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.2);
  background: rgba(8, 11, 10, 0.92);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.45;
  resize: vertical;
}

.opp-textarea--compact {
  font-size: 13px;
}

.opp-fallback {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6);
}

.opp-fallback-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.opp-btn {
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
}

.opp-btn--ghost {
  background: transparent;
  border-color: rgba(0, 230, 118, 0.25);
  color: var(--text-secondary);
}

.opp-btn--danger {
  background: rgba(120, 40, 45, 0.55);
  border-color: rgba(220, 80, 80, 0.4);
  color: rgba(255, 200, 200, 0.95);
}

.opp-fallback-title {
  margin: 0 0 var(--space-4);
  color: var(--text-secondary);
}

.opp-fallback-pre {
  overflow: auto;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.35);
  font-size: 12px;
  max-height: 60vh;
}
</style>
