<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { useAnalyticsSummary } from '@/composables/useAnalyticsSummary'

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

<style scoped>
.analytics {
  position: relative;
  z-index: 1;
  margin-bottom: clamp(2rem, 5vw, 3rem);
}

.analytics__head {
  text-align: center;
  margin-bottom: var(--space-6);
}

.analytics__title {
  margin: 0 0 var(--space-2);
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.analytics__sub {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-secondary);
  max-width: 32rem;
  margin-left: auto;
  margin-right: auto;
}

.analytics__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  min-height: 200px;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: rgba(12, 16, 14, 0.5);
}

.analytics__loading-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.analytics__alert {
  margin-bottom: var(--space-4);
}

.analytics__empty {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  margin-bottom: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(0, 230, 118, 0.25);
  background: rgba(0, 230, 118, 0.04);
}

.analytics__empty--after-kpi {
  margin-top: calc(-1 * var(--space-2));
  margin-bottom: var(--space-5);
}

.analytics__empty-title {
  margin: 0 0 var(--space-2);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.analytics__empty-hint {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-secondary);
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
}

.analytics__kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.analytics-kpi {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 230, 118, 0.18);
  background: linear-gradient(
    155deg,
    rgba(22, 29, 23, 0.9) 0%,
    rgba(12, 16, 14, 0.95) 100%
  );
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.05) inset,
    0 8px 32px rgba(0, 0, 0, 0.25);
}

.analytics-kpi__label {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.analytics-kpi__value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
}

.analytics-kpi__suffix {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.analytics__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--space-4);
}

.analytics-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 230, 118, 0.14);
  background: rgba(15, 20, 16, 0.85);
  backdrop-filter: blur(10px);
}

.analytics-card--wide {
  grid-column: 1 / -1;
}

.analytics-card__title {
  margin: 0 0 var(--space-1);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.analytics-card__hint {
  margin: 0 0 var(--space-4);
  font-size: 12px;
  color: var(--text-muted);
}

.analytics-card__none {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stack-bar {
  display: flex;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  margin-bottom: var(--space-4);
}

.stack-bar__seg {
  min-width: 2px;
  height: 100%;
  transition: width var(--transition-base);
}

.stack-bar__seg--high {
  background: linear-gradient(90deg, #00e676, #00c853);
}
.stack-bar__seg--med {
  background: linear-gradient(90deg, #ffab40, #ff8f00);
}
.stack-bar__seg--low {
  background: linear-gradient(90deg, #78909c, #546e7a);
}
.stack-bar__seg--ready {
  background: linear-gradient(90deg, #00e676, #00897b);
}
.stack-bar__seg--disc {
  background: linear-gradient(90deg, #00bcd4, #0097a7);
}
.stack-bar__seg--risk {
  background: linear-gradient(90deg, #ff5252, #c62828);
}
.stack-bar__seg--ct-tf {
  background: linear-gradient(90deg, #69f0ae, #00c853);
}
.stack-bar__seg--ct-ntf {
  background: linear-gradient(90deg, #b39ddb, #7e57c2);
}
.stack-bar__seg--ct-ent {
  background: linear-gradient(90deg, #64b5f6, #1565c0);
}
.stack-bar__seg--ct-agency {
  background: linear-gradient(90deg, #4dd0e1, #00838f);
}
.stack-bar__seg--ct-chaos {
  background: linear-gradient(90deg, #90a4ae, #546e7a);
}
.stack-bar__seg--ct-other {
  background: linear-gradient(90deg, #ffca28, #ff8f00);
}

.analytics-legend {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: 13px;
  color: var(--text-secondary);
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.dot--high {
  background: #00e676;
}
.dot--med {
  background: #ffab40;
}
.dot--low {
  background: #78909c;
}
.dot--ready {
  background: #00e676;
}
.dot--disc {
  background: #00bcd4;
}
.dot--risk {
  background: #ff5252;
}
.dot--ct-tf {
  background: #69f0ae;
}
.dot--ct-ntf {
  background: #b39ddb;
}
.dot--ct-ent {
  background: #64b5f6;
}
.dot--ct-agency {
  background: #4dd0e1;
}
.dot--ct-chaos {
  background: #90a4ae;
}
.dot--ct-other {
  background: #ffca28;
}

.risks-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  margin-bottom: var(--space-4);
}

.risks-meta__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.risks-meta__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.risks-meta__val {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.risk-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.risk-bar-row {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) minmax(80px, 3fr) 36px;
  align-items: center;
  gap: var(--space-3);
}

.risk-bar-row__label {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-bar-row__track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.risk-bar-row__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255, 82, 82, 0.85), rgba(255, 171, 64, 0.75));
  min-width: 4px;
  transition: width var(--transition-base);
}

.risk-bar-row__n {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  text-align: right;
}

.timeline-single {
  padding: var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.2);
  background: linear-gradient(
    145deg,
    rgba(22, 29, 23, 0.85) 0%,
    rgba(12, 16, 14, 0.92) 100%
  );
}

.timeline-single__date {
  margin: 0 0 var(--space-4);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.timeline-single__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-5);
}

.timeline-single__stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.timeline-single__num {
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.timeline-single__lbl {
  font-size: 12px;
  color: var(--text-secondary);
}

.timeline-single__note {
  margin: var(--space-4) 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}

.timeline-multi {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.timeline-table {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.12);
  overflow: hidden;
}

.timeline-table__head {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(0, 230, 118, 0.1);
}

.timeline-table__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.timeline-table__row:last-child {
  border-bottom: none;
}

.timeline-table__cell--date {
  color: var(--text-primary);
  font-weight: 500;
}

.timeline-table__cell--vol {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.timeline-table__bar {
  flex: 1;
  height: 8px;
  min-width: 24px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(0, 230, 118, 0.65), rgba(0, 137, 123, 0.45));
  max-width: 100%;
}

.timeline-table__count {
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 1.5rem;
  text-align: right;
}

.timeline-table__cell--score {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--accent-primary);
  text-align: right;
}

.timeline-spark {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.12);
  background: rgba(0, 0, 0, 0.2);
}

.timeline-spark__label {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.timeline-spark__svg {
  width: 100%;
  height: 56px;
  display: block;
}

.timeline-spark__line {
  stroke: rgba(0, 230, 118, 0.75);
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

@media (max-width: 640px) {
  .risk-bar-row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .risk-bar-row__track {
    order: 2;
  }

  .risk-bar-row__n {
    text-align: left;
  }

  .timeline__x {
    display: flex;
    flex-direction: column;
  }
}
</style>
