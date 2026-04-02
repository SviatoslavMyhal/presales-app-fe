<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import SavedReportCard from '@/components/reports/SavedReportCard.vue'
import { routeNames } from '@/router/route-names-registry'
import { useReportsList } from '@/composables/useReportsList'

const {
  limit,
  offset,
  reports,
  loading,
  error,
  deletingId,
  goDetail,
  onDeleteReport,
  nextPage,
  prevPage,
  formatDate,
  pageLabel,
} = useReportsList()
</script>

<template>
  <div class="reports-panel">
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
      <div class="reports-list-toolbar">
        <h2 class="reports-saved-heading">
          Saved reports
        </h2>
        <RouterLink
          :to="{ name: routeNames.analyze }"
          class="reports-new-analysis"
        >
          New analysis
        </RouterLink>
      </div>
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
        <SavedReportCard
          v-for="row in reports"
          :key="row.id"
          :row="row"
          :formatted-date="formatDate(row.created_at)"
          :deleting-id="deletingId"
          @open="goDetail"
          @delete="onDeleteReport"
        />
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
.reports-panel {
  position: relative;
  z-index: 1;
}

.reports-alert {
  position: relative;
  z-index: 1;
  margin-bottom: var(--space-5);
}

.reports-list-toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.reports-saved-heading {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.reports-new-analysis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-inverse);
  text-decoration: none;
  background: var(--gradient-brand);
  border-radius: var(--radius-md);
  border: none;
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.25),
    0 8px 28px rgba(0, 230, 118, 0.12);
  transition:
    filter var(--transition-fast),
    transform var(--transition-fast);
}

.reports-new-analysis:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.reports-new-analysis:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
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
  gap: 20px;
  padding: 4px;
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
