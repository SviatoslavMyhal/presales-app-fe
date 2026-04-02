<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ReportView from '@/components/ReportView.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { reportsDelete, reportsGetById } from '@/api/reports.api'
import type { ReportDetail } from '@/api/backend-types'
import type { IntelligenceResponse, SynthesisReport } from '@/types/presales'
import { routeNames } from '@/router/route-names-registry'
import { formatApiError } from '@/utils/api-error'
import { confirmDeleteReport } from '@/utils/confirmDeleteReport'
import { ElMessage } from 'element-plus'
import {
  extractStoredInputFields,
  extractStoredIntelligence,
  extractSynthesisReport,
} from '@/utils/storedReport'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const report = ref<ReportDetail | null>(null)
const deleting = ref(false)

const synthesisReport = computed((): SynthesisReport | null => {
  if (!report.value?.result) {
    return null
  }
  return extractSynthesisReport(report.value.result)
})

const intelligence = computed((): IntelligenceResponse | undefined => {
  return extractStoredIntelligence(report.value?.result)
})

const analyzeContext = computed(() => extractStoredInputFields(report.value?.result))

async function load () {
  const id = route.params.id as string
  if (!id) {
    error.value = 'Missing report id'
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  try {
    report.value = await reportsGetById(id)
  } catch (e) {
    error.value = formatApiError(e)
    report.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)

function back () {
  router.push({ name: routeNames.reports })
}

async function onRequestDelete () {
  const id = report.value?.id
  if (!id || deleting.value) {
    return
  }
  try {
    await confirmDeleteReport(report.value?.title ?? '')
  } catch {
    return
  }
  deleting.value = true
  try {
    await reportsDelete(id)
    ElMessage.success('Report deleted')
    await router.push({ name: routeNames.reports })
  } catch (e) {
    ElMessage.error(formatApiError(e))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="detail-page">
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      class="detail-alert"
    />

    <div
      class="detail-body"
      :class="{ 'detail-body--loading': loading }"
    >
      <div
        v-if="loading"
        class="brand-loading-mask"
        aria-busy="true"
      >
        <BrandLoader size="lg" />
      </div>

      <ReportView
        v-if="synthesisReport"
        variant="saved"
        :report="synthesisReport"
        :document-title="report?.title ?? null"
        :intelligence="intelligence"
        :job-post="analyzeContext.jobPost"
        :client-messages="analyzeContext.clientMessages"
        :team-expertise="analyzeContext.teamExpertise"
        :constraints="analyzeContext.constraints"
        :saved-report-id="report?.id ?? null"
        :delete-in-progress="deleting"
        @leave="back"
        @request-delete="onRequestDelete"
      />

      <div
        v-else-if="report && !loading"
        class="fallback"
      >
        <div class="fallback-toolbar">
          <button
            type="button"
            class="fallback-btn fallback-btn--ghost"
            @click="back"
          >
            Back to reports
          </button>
          <button
            type="button"
            class="fallback-btn fallback-btn--danger"
            :disabled="deleting"
            @click="onRequestDelete"
          >
            {{ deleting ? 'Deleting…' : 'Delete report' }}
          </button>
        </div>
        <p class="fallback-title">
          This saved payload doesn’t include a full synthesis report.
        </p>
        <p class="fallback-hint">
          Raw JSON is shown below. If you expect the full report UI, check that the backend stores the same shape as the analyze response (<code>synthesis.report</code>).
        </p>
        <pre class="fallback-pre">{{ JSON.stringify(report.result, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  width: 100%;
  min-height: min(100vh, 100dvh);
  margin: 0 auto;
  background: var(--bg-base);
}

.detail-alert {
  max-width: 720px;
  margin: 0 auto var(--space-4);
}

.detail-body {
  position: relative;
  min-height: 200px;
}

.detail-body--loading {
  min-height: min(60vh, 520px);
}

.brand-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 11, 10, 0.78);
  backdrop-filter: blur(6px);
  border-radius: var(--radius-lg);
}

.fallback-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.fallback-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 var(--space-4);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    opacity var(--transition-fast);
}

.fallback-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.fallback-btn--ghost {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-default);
}

.fallback-btn--ghost:hover:not(:disabled) {
  color: var(--accent-primary);
  border-color: rgba(0, 230, 118, 0.45);
}

.fallback-btn--danger {
  color: #fff;
  background: linear-gradient(
    145deg,
    rgba(200, 60, 60, 0.95) 0%,
    rgba(150, 40, 50, 0.98) 100%
  );
  border: 1px solid rgba(255, 100, 100, 0.35);
  box-shadow: 0 4px 18px rgba(160, 40, 50, 0.35);
}

.fallback-btn--danger:hover:not(:disabled) {
  filter: brightness(1.06);
}

.fallback {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-8);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(0, 230, 118, 0.2);
  background: linear-gradient(
    145deg,
    rgba(22, 29, 23, 0.85) 0%,
    rgba(12, 16, 14, 0.9) 100%
  );
  box-shadow: 0 0 60px rgba(0, 230, 118, 0.06);
}

.fallback-title {
  margin: 0 0 var(--space-3);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.fallback-hint {
  margin: 0 0 var(--space-5);
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.fallback-hint code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent-primary);
}

.fallback-pre {
  margin: 0;
  padding: var(--space-4);
  max-height: 60vh;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.35);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.12);
}
</style>
