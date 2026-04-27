<script setup lang="ts">
import SavedReportCard from '@/components/reports/SavedReportCard.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { useOpportunityBoard } from '@/composables/useOpportunityBoard'
import { useReportsList } from '@/composables/useReportsList'
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

const { dueSoon, stale, needsInput } = useOpportunityBoard(reports)
const router = useRouter()

const dueSoonIds = computed(() => new Set(dueSoon.value.map(e => e.row.id)))
const staleOnly = computed(() => stale.value.filter(e => !dueSoonIds.value.has(e.row.id)))
const staleIds = computed(() => new Set(staleOnly.value.map(e => e.row.id)))
const needsOnly = computed(() =>
  needsInput.value.filter(e => !dueSoonIds.value.has(e.row.id) && !staleIds.value.has(e.row.id)),
)

function openOpportunity(id: string) {
  void router.push({
    name: routeNames.opportunityDetail,
    params: { id },
    query: { mode: 'prepare' },
  })
}
</script>

<template>
  <div class="today">
    <header class="today__hero">
      <p class="today__kicker">
        Workspace
      </p>
      <h1 class="today__title">
        Today
      </h1>
      <p class="today__lede">
        What needs attention before your next call — ranked by time and signal.
      </p>
    </header>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      class="today__alert"
    />

    <div
      class="today__body"
      :class="{ 'today__body--loading': loading }"
    >
      <div
        v-if="loading"
        class="today__loader"
        aria-busy="true"
      >
        <BrandLoader size="lg" />
      </div>

      <template v-else>
        <section
          v-if="dueSoon.length"
          class="today__section"
        >
          <h2 class="today__section-title">
            Due soon
          </h2>
          <p class="today__section-hint">
            Calls in the next 48 hours
          </p>
          <div class="today__grid">
            <SavedReportCard
              v-for="e in dueSoon"
              :key="e.row.id"
              :row="e.row"
              :formatted-date="formatDate(e.row.created_at)"
              :deleting-id="deletingId"
              @open="openOpportunity"
              @delete="onDeleteReport"
            />
          </div>
        </section>

        <section
          v-if="staleOnly.length"
          class="today__section"
        >
          <h2 class="today__section-title">
            Stale
          </h2>
          <p class="today__section-hint">
            No updates in 7+ days — revisit or archive
          </p>
          <div class="today__grid">
            <SavedReportCard
              v-for="e in staleOnly"
              :key="e.row.id"
              :row="e.row"
              :formatted-date="formatDate(e.row.created_at)"
              :deleting-id="deletingId"
              @open="openOpportunity"
              @delete="onDeleteReport"
            />
          </div>
        </section>

        <section
          v-if="needsOnly.length"
          class="today__section"
        >
          <h2 class="today__section-title">
            Needs input
          </h2>
          <p class="today__section-hint">
            Add a clear title or constraints for better prep
          </p>
          <div class="today__grid">
            <SavedReportCard
              v-for="e in needsOnly"
              :key="e.row.id"
              :row="e.row"
              :formatted-date="formatDate(e.row.created_at)"
              :deleting-id="deletingId"
              @open="openOpportunity"
              @delete="onDeleteReport"
            />
          </div>
        </section>

        <div
          v-if="!dueSoon.length && !staleOnly.length && !needsOnly.length && reports.length"
          class="today__empty today__empty--soft"
        >
          <p>You’re clear — nothing urgent in the queue.</p>
          <RouterLink
            :to="{ name: routeNames.pipeline }"
            class="today__link"
          >
            View pipeline
          </RouterLink>
        </div>

        <div
          v-else-if="!reports.length"
          class="today__empty"
        >
          <p class="today__empty-title">
            No opportunities yet
          </p>
          <p class="today__empty-hint">
            Run a capture to create your first prep plan.
          </p>
          <RouterLink
            :to="{ name: routeNames.analyze }"
            class="today__cta"
          >
            New capture
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.today {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.today__hero {
  margin-bottom: clamp(1.5rem, 4vw, 2.25rem);
  text-align: center;
}

.today__kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.today__title {
  margin: 0 0 var(--space-3);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.today__lede {
  margin: 0 auto;
  max-width: 36rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.today__alert {
  margin-bottom: var(--space-5);
}

.today__body {
  position: relative;
  min-height: 200px;
}

.today__body--loading {
  min-height: 320px;
}

.today__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.today__section {
  margin-bottom: clamp(2rem, 5vw, 3rem);
}

.today__section-title {
  margin: 0 0 var(--space-1);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.today__section-hint {
  margin: 0 0 var(--space-4);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.today__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-5);
}

.today__empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(0, 230, 118, 0.2);
  color: var(--text-secondary);
}

.today__empty--soft {
  border-style: solid;
  background: rgba(0, 230, 118, 0.04);
}

.today__empty-title {
  margin: 0 0 var(--space-2);
  font-weight: 700;
  color: var(--text-primary);
}

.today__empty-hint {
  margin: 0 0 var(--space-5);
  font-size: 0.9375rem;
}

.today__cta {
  display: inline-flex;
  padding: var(--space-3) var(--space-6);
  border-radius: 999px;
  background: rgba(0, 230, 118, 0.15);
  border: 1px solid rgba(0, 230, 118, 0.35);
  color: var(--accent-primary);
  font-weight: 600;
  text-decoration: none;
}

.today__cta:hover {
  background: rgba(0, 230, 118, 0.22);
}

.today__link {
  color: var(--accent-primary);
  font-weight: 600;
}
</style>
