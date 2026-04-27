<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { OPPORTUNITY_STAGES, type OpportunityStage } from '@/domain/opportunity'
import { useOpportunityBoard } from '@/composables/useOpportunityBoard'
import { useReportsList } from '@/composables/useReportsList'
import { useOpportunityMetaStore } from '@/stores/opportunity-meta.store'
import { routeNames } from '@/router/route-names-registry'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const {
  reports,
  loading,
  error,
  deletingId,
  onDeleteReport,
  formatDate,
} = useReportsList()

const metaStore = useOpportunityMetaStore()
const { enriched } = useOpportunityBoard(reports)
const router = useRouter()

const cols = computed(() =>
  OPPORTUNITY_STAGES.map(s => ({
    stage: s.value,
    label: s.label,
    items: enriched.value.filter(e => e.meta.stage === s.value),
  })),
)

function openOpportunity(id: string) {
  void router.push({
    name: routeNames.opportunityDetail,
    params: { id },
    query: { mode: 'prepare' },
  })
}

function setStage(id: string, stage: OpportunityStage) {
  metaStore.setStage(id, stage)
}
</script>

<template>
  <div class="pipe">
    <header class="pipe__hero">
      <p class="pipe__kicker">
        Workspace
      </p>
      <h1 class="pipe__title">
        Pipeline
      </h1>
      <p class="pipe__lede">
        Every saved prep is an opportunity — move stages as the deal progresses.
      </p>
      <RouterLink
        :to="{ name: routeNames.analyze }"
        class="pipe__new"
      >
        New capture
      </RouterLink>
    </header>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      class="pipe__alert"
    />

    <div
      class="pipe__body"
      :class="{ 'pipe__body--loading': loading }"
    >
      <div
        v-if="loading"
        class="pipe__loader"
        aria-busy="true"
      >
        <BrandLoader size="lg" />
      </div>

      <div
        v-else-if="reports.length"
        class="pipe__board"
      >
        <section
          v-for="col in cols"
          :key="col.stage"
          class="pipe__column"
        >
          <h2 class="pipe__column-title">
            {{ col.label }}
            <span class="pipe__count">{{ col.items.length }}</span>
          </h2>
          <ul class="pipe__list">
            <li
              v-for="e in col.items"
              :key="e.row.id"
              class="pipe__card"
            >
              <button
                type="button"
                class="pipe__open"
                @click="openOpportunity(e.row.id)"
              >
                <span class="pipe__card-title">{{ e.row.title || 'Untitled' }}</span>
                <p
                  v-if="e.row.job_post?.trim()"
                  class="pipe__job"
                >
                  {{ e.row.job_post }}
                </p>
                <time
                  class="pipe__time"
                  :datetime="e.row.updated_at"
                >{{ formatDate(e.row.updated_at) }}</time>
              </button>
              <div class="pipe__row">
                <label class="pipe__sr-only">Stage</label>
                <select
                  class="pipe__select"
                  :value="e.meta.stage"
                  @change="setStage(e.row.id, ($event.target as HTMLSelectElement).value as OpportunityStage)"
                >
                  <option
                    v-for="s in OPPORTUNITY_STAGES"
                    :key="s.value"
                    :value="s.value"
                  >
                    {{ s.label }}
                  </option>
                </select>
                <button
                  type="button"
                  class="pipe__delete"
                  :disabled="deletingId !== null"
                  aria-label="Delete"
                  @click="onDeleteReport(e.row, $event)"
                >
                  ×
                </button>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <div
        v-else
        class="pipe__empty"
      >
        <p class="pipe__empty-title">
          Pipeline is empty
        </p>
        <p class="pipe__empty-hint">
          Capture a job post to generate your first opportunity.
        </p>
        <RouterLink
          :to="{ name: routeNames.analyze }"
          class="pipe__cta"
        >
          Start capture
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pipe {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.pipe__hero {
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  text-align: center;
}

.pipe__kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.pipe__title {
  margin: 0 0 var(--space-3);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pipe__lede {
  margin: 0 auto var(--space-5);
  max-width: 38rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.pipe__new {
  display: inline-flex;
  padding: var(--space-2) var(--space-5);
  border-radius: 999px;
  border: 1px solid rgba(0, 230, 118, 0.35);
  background: rgba(0, 230, 118, 0.08);
  color: var(--accent-primary);
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
}

.pipe__new:hover {
  background: rgba(0, 230, 118, 0.14);
}

.pipe__alert {
  margin-bottom: var(--space-5);
}

.pipe__body {
  position: relative;
  min-height: 200px;
}

.pipe__body--loading {
  min-height: 320px;
}

.pipe__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.pipe__board {
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr));
  gap: var(--space-4);
  align-items: start;
}

@media (max-width: 1200px) {
  .pipe__board {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

.pipe__column {
  min-width: 0;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 230, 118, 0.12);
  background: rgba(8, 11, 10, 0.5);
  padding: var(--space-3);
}

.pipe__column-title {
  margin: 0 0 var(--space-3);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.pipe__count {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 230, 118, 0.1);
  color: var(--accent-primary);
}

.pipe__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pipe__card {
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.14);
  background: rgba(14, 18, 16, 0.95);
  overflow: hidden;
}

.pipe__open {
  display: block;
  width: 100%;
  padding: var(--space-3);
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
}

.pipe__open:hover {
  background: rgba(0, 230, 118, 0.06);
}

.pipe__card-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.pipe__job {
  margin: 0 0 var(--space-2);
  font-size: 12px;
  line-height: 1.35;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pipe__time {
  font-size: 12px;
  color: var(--text-muted);
}

.pipe__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid rgba(0, 230, 118, 0.08);
}

.pipe__select {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.2);
  background: rgba(8, 11, 10, 0.9);
  color: var(--text-primary);
  font-size: 12px;
  font-family: inherit;
}

.pipe__delete {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(220, 80, 80, 0.35);
  background: rgba(40, 14, 16, 0.6);
  color: rgba(255, 170, 170, 0.95);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.pipe__delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pipe__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.pipe__empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(0, 230, 118, 0.2);
}

.pipe__empty-title {
  margin: 0 0 var(--space-2);
  font-weight: 700;
  color: var(--text-primary);
}

.pipe__empty-hint {
  margin: 0 0 var(--space-5);
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.pipe__cta {
  display: inline-flex;
  padding: var(--space-3) var(--space-6);
  border-radius: 999px;
  background: rgba(0, 230, 118, 0.15);
  border: 1px solid rgba(0, 230, 118, 0.35);
  color: var(--accent-primary);
  font-weight: 600;
  text-decoration: none;
}
</style>
