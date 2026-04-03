<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { useAnalyticsSummary } from '@/composables/useAnalyticsSummary'
import { downloadAnalyticsRisksClientCsv } from '@/utils/analyticsCsvExport'

withDefaults(
  defineProps<{
    /** When true, hide the large title block (use on /reports/analytics when layout provides the header). */
    hideIntro?: boolean
  }>(),
  { hideIntro: false }
)

const {
  loading,
  error,
  data,
  isEmpty,
  riskRows,
  maxRiskCount,
  oppTotal,
  convTotal,
  clientTotal,
  clientTypeSegments,
  timelineBars,
  sparkPoints,
  firstTimelinePoint,
  pct,
  shortDate,
  fmt1,
} = useAnalyticsSummary()

function handleExportCsv () {
  const d = data.value
  downloadAnalyticsRisksClientCsv(
    riskRows.value.map((r) => ({ key: r.key, label: r.label, count: r.count })),
    clientTypeSegments.value.map((s) => ({
      key: s.key,
      label: s.label,
      count: s.count,
      pct: s.pct,
    })),
    d ? { totalReports: d.summary.total_reports } : undefined,
  )
}
</script>

<template>
  <section
    class="analytics"
    :aria-labelledby="hideIntro ? undefined : 'analytics-heading'"
    :aria-label="hideIntro ? 'Analytics dashboard' : undefined"
  >
    <div
      v-if="!hideIntro"
      class="analytics__head"
    >
      <h2
        id="analytics-heading"
        class="analytics__title"
      >
        Analytics dashboard
      </h2>
      <p class="analytics__sub">
        Aggregated signals from saved presales reports in your workspace.
      </p>
    </div>

    <div
      v-if="loading"
      class="analytics__loading"
      aria-busy="true"
    >
      <BrandLoader size="lg" />
      <span class="analytics__loading-text">Loading analytics…</span>
    </div>

    <el-alert
      v-else-if="error"
      :title="error"
      type="error"
      show-icon
      class="analytics__alert"
    />

    <template v-else-if="data">
      <div class="analytics__kpi-toolbar">
        <div class="analytics__kpi-row">
          <article class="analytics-kpi">
            <p class="analytics-kpi__label">
              Total reports
            </p>
            <p class="analytics-kpi__value">
              {{ data.summary.total_reports }}
            </p>
          </article>
          <article class="analytics-kpi">
            <p class="analytics-kpi__label">
              Avg opportunity score
            </p>
            <p class="analytics-kpi__value">
              {{ fmt1(data.summary.avg_opportunity_score) }}
            </p>
          </article>
          <article class="analytics-kpi">
            <p class="analytics-kpi__label">
              Avg confidence
            </p>
            <p class="analytics-kpi__value">
              {{ fmt1(data.summary.avg_confidence) }}
              <span class="analytics-kpi__suffix">/ 10</span>
            </p>
          </article>
        </div>
        <div
          v-if="!isEmpty"
          class="analytics__kpi-export"
        >
          <button
            type="button"
            class="analytics-export-btn"
            @click="handleExportCsv"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div
        v-if="isEmpty"
        class="analytics__empty analytics__empty--after-kpi"
        role="status"
      >
        <p class="analytics__empty-title">
          No analytics yet
        </p>
        <p class="analytics__empty-hint">
          Save reports from your analyses to populate scores, risk mix, client mix, and daily trends.
        </p>
      </div>

      <div
        v-else
        class="analytics__grid"
      >
        <article class="analytics-card">
          <h3 class="analytics-card__title">
            Opportunity mix
          </h3>
          <p class="analytics-card__hint">
            High / medium / low opportunity strength
          </p>
          <div
            v-if="oppTotal > 0"
            class="stack-bar"
            role="img"
            :aria-label="`High ${pct(data.opportunities.high, oppTotal)} percent, medium ${pct(data.opportunities.medium, oppTotal)} percent, low ${pct(data.opportunities.low, oppTotal)} percent`"
          >
            <div
              class="stack-bar__seg stack-bar__seg--high"
              :style="{ width: `${pct(data.opportunities.high, oppTotal)}%` }"
            />
            <div
              class="stack-bar__seg stack-bar__seg--med"
              :style="{ width: `${pct(data.opportunities.medium, oppTotal)}%` }"
            />
            <div
              class="stack-bar__seg stack-bar__seg--low"
              :style="{ width: `${pct(data.opportunities.low, oppTotal)}%` }"
            />
          </div>
          <ul
            v-if="oppTotal > 0"
            class="analytics-legend"
          >
            <li><span class="dot dot--high" /> High · {{ data.opportunities.high }}</li>
            <li><span class="dot dot--med" /> Medium · {{ data.opportunities.medium }}</li>
            <li><span class="dot dot--low" /> Low · {{ data.opportunities.low }}</li>
          </ul>
          <p
            v-else
            class="analytics-card__none"
          >
            No opportunity breakdown yet.
          </p>
        </article>

        <article class="analytics-card">
          <h3 class="analytics-card__title">
            Conversion signals
          </h3>
          <p class="analytics-card__hint">
            Ready to start · needs discovery · high risk
          </p>
          <div
            v-if="convTotal > 0"
            class="stack-bar"
            role="img"
            :aria-label="`Conversion mix across ${convTotal} signals`"
          >
            <div
              class="stack-bar__seg stack-bar__seg--ready"
              :style="{ width: `${pct(data.conversion_signals.ready_to_start, convTotal)}%` }"
            />
            <div
              class="stack-bar__seg stack-bar__seg--disc"
              :style="{ width: `${pct(data.conversion_signals.needs_discovery, convTotal)}%` }"
            />
            <div
              class="stack-bar__seg stack-bar__seg--risk"
              :style="{ width: `${pct(data.conversion_signals.high_risk, convTotal)}%` }"
            />
          </div>
          <ul
            v-if="convTotal > 0"
            class="analytics-legend"
          >
            <li><span class="dot dot--ready" /> Ready · {{ data.conversion_signals.ready_to_start }}</li>
            <li><span class="dot dot--disc" /> Discovery · {{ data.conversion_signals.needs_discovery }}</li>
            <li><span class="dot dot--risk" /> High risk · {{ data.conversion_signals.high_risk }}</li>
          </ul>
          <p
            v-else
            class="analytics-card__none"
          >
            No conversion signals yet.
          </p>
        </article>

        <article class="analytics-card">
          <h3 class="analytics-card__title">
            Client types
          </h3>
          <p class="analytics-card__hint">
            Founders, enterprise, agency, and mixed / unclear profiles
          </p>
          <div
            v-if="clientTotal > 0"
            class="stack-bar"
            role="img"
            :aria-label="`Client mix: ${clientTypeSegments.map((s) => `${s.label} ${s.count}`).join(', ')}`"
          >
            <div
              v-for="seg in clientTypeSegments"
              :key="seg.key"
              class="stack-bar__seg"
              :class="seg.stackClass"
              :style="{ width: `${seg.pct}%` }"
            />
          </div>
          <ul
            v-if="clientTotal > 0"
            class="analytics-legend"
          >
            <li
              v-for="seg in clientTypeSegments"
              :key="seg.key"
            >
              <span
                class="dot"
                :class="seg.dotClass"
              /> {{ seg.label }} · {{ seg.count }}
            </li>
          </ul>
          <p
            v-else
            class="analytics-card__none"
          >
            No client type data yet.
          </p>
        </article>

        <article class="analytics-card analytics-card--wide">
          <h3 class="analytics-card__title">
            Risks
          </h3>
          <div class="risks-meta">
            <div class="risks-meta__item">
              <span class="risks-meta__label">High-severity total</span>
              <span class="risks-meta__val">{{ data.risks.total_high }}</span>
            </div>
            <div class="risks-meta__item">
              <span class="risks-meta__label">Most common</span>
              <span class="risks-meta__val">{{ data.risks.most_common ? formatLabel(data.risks.most_common) : '—' }}</span>
            </div>
          </div>
          <div
            v-if="riskRows.length"
            class="risk-bars"
          >
            <div
              v-for="row in riskRows"
              :key="row.key"
              class="risk-bar-row"
            >
              <span class="risk-bar-row__label">{{ row.label }}</span>
              <div class="risk-bar-row__track">
                <div
                  class="risk-bar-row__fill"
                  :style="{ width: `${(row.count / maxRiskCount) * 100}%` }"
                />
              </div>
              <span class="risk-bar-row__n">{{ row.count }}</span>
            </div>
          </div>
          <p
            v-else
            class="analytics-card__none"
          >
            No risk distribution yet.
          </p>
        </article>

        <article class="analytics-card analytics-card--wide">
          <h3 class="analytics-card__title">
            Activity by day
          </h3>
          <p class="analytics-card__hint">
            How many reports landed each day and the average opportunity score for that day.
          </p>

          <div
            v-if="firstTimelinePoint"
            class="timeline-single"
          >
            <p class="timeline-single__date">
              {{ shortDate(firstTimelinePoint.date) }}
            </p>
            <div class="timeline-single__stats">
              <div class="timeline-single__stat">
                <span class="timeline-single__num">{{ firstTimelinePoint.reports }}</span>
                <span class="timeline-single__lbl">reports this day</span>
              </div>
              <div class="timeline-single__stat">
                <span class="timeline-single__num">{{ fmt1(firstTimelinePoint.avg_score) }}</span>
                <span class="timeline-single__lbl">avg score on that day</span>
              </div>
            </div>
            <p class="timeline-single__note">
              When more days appear, you’ll see a full table and a trend line across days.
            </p>
          </div>

          <div
            v-else-if="timelineBars.length >= 2"
            class="timeline-multi"
          >
            <div
              class="timeline-table"
              role="table"
              aria-label="Reports and scores by day"
            >
              <div
                class="timeline-table__head"
                role="row"
              >
                <span role="columnheader">Day</span>
                <span role="columnheader">Reports</span>
                <span role="columnheader">Avg score</span>
              </div>
              <div
                v-for="row in timelineBars"
                :key="row.date"
                class="timeline-table__row"
                role="row"
              >
                <span class="timeline-table__cell timeline-table__cell--date">{{ shortDate(row.date) }}</span>
                <span class="timeline-table__cell timeline-table__cell--vol">
                  <span class="timeline-table__bar" :style="{ width: `${row.barPct}%` }" />
                  <span class="timeline-table__count">{{ row.reports }}</span>
                </span>
                <span class="timeline-table__cell timeline-table__cell--score">{{ fmt1(row.avg_score) }}</span>
              </div>
            </div>
            <div
              v-if="sparkPoints"
              class="timeline-spark"
            >
              <p class="timeline-spark__label">
                Avg score trend (by day)
              </p>
              <svg
                class="timeline-spark__svg"
                viewBox="0 0 100 22"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  class="timeline-spark__line"
                  :points="sparkPoints"
                  fill="none"
                />
              </svg>
            </div>
          </div>
          <p
            v-else
            class="analytics-card__none"
          >
            No daily timeline yet.
          </p>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped src="@/assets/styles/analytics-dashboard.css"></style>
