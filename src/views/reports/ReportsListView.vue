<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { reportsDelete, reportsList } from '@/api/reports.api'
import type { ReportListItem } from '@/api/backend-types'
import { routeNames } from '@/router/route-names-registry'
import { formatApiError } from '@/utils/api-error'
import { confirmDeleteReport } from '@/utils/confirmDeleteReport'
import { ElMessage } from 'element-plus'

const router = useRouter()

const limit = 5
const offset = ref(0)
const reports = ref<ReportListItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
/** Id of report currently being deleted (for per-card loading state) */
const deletingId = ref<string | null>(null)

async function load () {
  loading.value = true
  error.value = null
  try {
    const res = await reportsList({ limit, offset: offset.value })
    reports.value = res.reports
  } catch (e) {
    error.value = formatApiError(e)
    reports.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

watch(offset, load)

function goDetail (id: string) {
  router.push({ name: routeNames.reportDetail, params: { id } })
}

async function onDeleteReport (row: ReportListItem, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (deletingId.value) {
    return
  }
  try {
    await confirmDeleteReport(row.title || 'Untitled report')
  } catch {
    return
  }
  deletingId.value = row.id
  try {
    await reportsDelete(row.id)
    ElMessage.success('Report deleted')
    await load()
  } catch (err) {
    ElMessage.error(formatApiError(err))
  } finally {
    deletingId.value = null
  }
}

function nextPage () {
  if (reports.value.length >= limit) {
    offset.value += limit
  }
}

function prevPage () {
  if (offset.value >= limit) {
    offset.value -= limit
  }
}

function formatDate (iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return iso
  }
}

const pageLabel = computed(() => {
  const start = offset.value + 1
  const end = offset.value + reports.value.length
  if (!reports.value.length) {
    return ''
  }
  return `${start}–${end}`
})
</script>

<template>
  <div class="reports-page">
    <div
      class="reports-bg"
      aria-hidden="true"
    />

    <header class="reports-hero">
      <p class="reports-kicker">
        Workspace
      </p>
      <h1 class="reports-title">
        My reports
      </h1>
      <p class="reports-lede">
        Saved analyses from your account — open any card to see the full report experience.
      </p>
    </header>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      class="reports-alert"
    />

    <div
      class="reports-content"
      :class="{ 'reports-content--loading': loading }"
    >
      <div
        v-if="loading"
        class="brand-loading-mask"
        aria-busy="true"
      >
        <BrandLoader size="lg" />
      </div>

      <div
        v-if="reports.length"
        class="reports-grid"
      >
        <div
          v-for="row in reports"
          :key="row.id"
          class="report-card-wrap"
        >
          <button
            type="button"
            class="report-card"
            :class="{ 'report-card--busy': deletingId === row.id }"
            :disabled="deletingId === row.id"
            @click="goDetail(row.id)"
          >
            <span
              class="report-card__edge"
              aria-hidden="true"
            />
            <span
              class="report-card__shine"
              aria-hidden="true"
            />
            <h2 class="report-card__title">
              {{ row.title || 'Untitled report' }}
            </h2>
            <time
              class="report-card__time"
              :datetime="row.created_at"
            >{{ formatDate(row.created_at) }}</time>
            <span class="report-card__cta">
              Open report
              <span
                class="report-card__arrow"
                aria-hidden="true"
              >→</span>
            </span>
          </button>
          <button
            type="button"
            class="report-card__delete"
            :disabled="deletingId !== null"
            :aria-label="`Delete report ${row.title || 'Untitled report'}`"
            title="Delete report"
            @click="onDeleteReport(row, $event)"
          >
            <span
              v-if="deletingId === row.id"
              class="report-card__delete-loader"
              aria-hidden="true"
            >
              <BrandLoader size="xs" />
            </span>
            <svg
              v-else
              class="report-card__delete-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-else-if="!loading"
        class="reports-empty"
      >
        <div class="reports-empty__icon" aria-hidden="true">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 44h40v8H12v-8zm4-24h32l4 8v16H12V28l4-8z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
              opacity="0.35"
            />
            <path
              d="M20 20h24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
        <p class="reports-empty__title">
          No saved reports yet
        </p>
        <p class="reports-empty__hint">
          Run an analysis from the home flow, then use <strong>Save</strong> on the results screen while signed in.
        </p>
      </div>

      <nav
        v-if="reports.length"
        class="reports-pager"
        aria-label="Pagination"
      >
        <button
          type="button"
          class="pager-btn"
          :disabled="offset === 0"
          @click="prevPage"
        >
          Previous
        </button>
        <span class="pager-meta">{{ pageLabel }}</span>
        <button
          type="button"
          class="pager-btn"
          :disabled="reports.length < limit"
          @click="nextPage"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.reports-page {
  position: relative;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding:
    calc(var(--space-12) + var(--space-4))
    clamp(1.25rem, 4vw, 2.5rem)
    clamp(3rem, 8vh, 5rem);
  box-sizing: border-box;
}

.reports-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0, 230, 118, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 100% 60%, rgba(0, 137, 123, 0.06) 0%, transparent 45%);
}

.reports-hero {
  position: relative;
  z-index: 1;
  margin-bottom: clamp(2rem, 5vw, 3rem);
  padding: 0 clamp(0.25rem, 2vw, 1rem);
  text-align: center;
}

.reports-kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-primary);
  opacity: 0.9;
}

.reports-title {
  margin: 0 0 var(--space-3);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.reports-lede {
  margin: 0 auto;
  max-width: 36rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.reports-alert {
  position: relative;
  z-index: 1;
  margin-bottom: var(--space-5);
}

.reports-content {
  position: relative;
  z-index: 1;
  min-height: 200px;
}

.reports-content--loading {
  min-height: min(50vh, 420px);
}

.reports-content .brand-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 11, 10, 0.72);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-lg);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 16px;
  padding: 4px;
}

.report-card-wrap {
  position: relative;
  display: block;
  min-height: 160px;
}

.report-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  min-height: 160px;
  padding: 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  background: linear-gradient(
    160deg,
    rgba(26, 34, 28, 0.88) 0%,
    rgba(12, 16, 14, 0.94) 48%,
    rgba(18, 24, 20, 0.9) 100%
  );
  border: 1px solid rgba(0, 230, 118, 0.2);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.06) inset,
    0 4px 24px rgba(0, 0, 0, 0.25),
    0 20px 56px rgba(0, 0, 0, 0.35),
    0 0 40px rgba(0, 230, 118, 0.04);
  transition:
    transform var(--transition-base),
    border-color var(--transition-fast),
    box-shadow var(--transition-base);
  overflow: hidden;
  width: 100%;
  min-height: 160px;
  padding-right: 52px;
}

.report-card--busy {
  opacity: 0.72;
  pointer-events: none;
}

.report-card__edge {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 230, 118, 0.45) 45%,
    rgba(0, 200, 160, 0.25) 100%
  );
  opacity: 0.85;
  pointer-events: none;
}

.report-card__shine {
  position: absolute;
  inset: -1px;
  background: linear-gradient(
    125deg,
    rgba(0, 230, 118, 0.14) 0%,
    transparent 38%,
    transparent 62%,
    rgba(0, 137, 123, 0.1) 100%
  );
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.report-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 230, 118, 0.42);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.12) inset,
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 28px 64px rgba(0, 0, 0, 0.42),
    0 0 56px rgba(0, 230, 118, 0.1);
}

.report-card:hover .report-card__shine {
  opacity: 1;
}

.report-card:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
}

.report-card__title {
  position: relative;
  z-index: 1;
  margin: 0 0 12px;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-card__time {
  position: relative;
  z-index: 1;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.report-card__cta {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding-top: 20px;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--accent-primary);
  text-shadow: 0 0 20px rgba(0, 230, 118, 0.25);
}

.report-card__arrow {
  transition: transform var(--transition-fast);
}

.report-card:hover .report-card__arrow {
  transform: translateX(4px);
}

.report-card__delete {
  position: absolute;
  top: 18px;
  right: 16px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgba(220, 80, 80, 0.35);
  border-radius: var(--radius-md);
  color: rgba(255, 150, 150, 0.95);
  background: rgba(200, 60, 60, 0.14);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.report-card__delete:hover:not(:disabled) {
  color: #ffc9c9;
  background: rgba(200, 60, 60, 0.28);
  border-color: rgba(255, 120, 120, 0.55);
  box-shadow: 0 0 28px rgba(200, 60, 60, 0.22);
  transform: scale(1.04);
}

.report-card__delete:focus-visible {
  outline: 2px solid rgba(255, 140, 140, 0.85);
  outline-offset: 2px;
}

.report-card__delete:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.report-card__delete-icon {
  width: 18px;
  height: 18px;
}

.report-card__delete-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-card__delete-loader :deep(.brand-loader) {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.35));
}

.reports-empty {
  text-align: center;
  padding: 48px 24px;
  border-radius: 12px;
  border: 1px dashed rgba(0, 230, 118, 0.22);
  background: rgba(0, 230, 118, 0.04);
}

.reports-empty__icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-5);
  color: var(--accent-muted);
}

.reports-empty__title {
  margin: 0 0 var(--space-2);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.reports-empty__hint {
  margin: 0;
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.reports-empty__hint strong {
  color: var(--accent-primary);
  font-weight: 600;
}

.reports-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: clamp(2.5rem, 6vw, 4rem);
  padding: 20px 24px;
  border-radius: 12px;
  background: rgba(12, 16, 14, 0.65);
  border: 1px solid rgba(0, 230, 118, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.pager-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 128px;
  height: 44px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-primary);
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid rgba(0, 230, 118, 0.38);
  border-radius: 8px;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.pager-btn:hover:not(:disabled) {
  color: var(--accent-primary);
  background: rgba(0, 230, 118, 0.16);
  border-color: rgba(0, 230, 118, 0.55);
  box-shadow: 0 0 28px rgba(0, 230, 118, 0.18);
}

.pager-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  color: var(--text-muted);
}

.pager-meta {
  min-width: 5.5rem;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
}
</style>
