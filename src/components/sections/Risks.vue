<script setup lang="ts">
import { computed } from 'vue'
import type { Risk as RiskType } from '@/types/presales'
import { formatLabel } from '@/utils/formatLabel'

const props = defineProps<{
  risks: RiskType[]
}>()

const ORDER = ['high', 'medium', 'low'] as const

const GROUP_META: Record<
  (typeof ORDER)[number],
  { title: string; hint: string; short: string }
> = {
  high: {
    title: 'High severity',
    short: 'High',
    hint: 'Address early — impacts timeline, scope, or trust.',
  },
  medium: {
    title: 'Medium severity',
    short: 'Medium',
    hint: 'Plan ownership and checkpoints before commitment.',
  },
  low: {
    title: 'Lower severity',
    short: 'Low',
    hint: 'Monitor — useful context for discovery.',
  },
}

const grouped = computed(() => {
  const map = new Map<string, RiskType[]>()
  for (const s of ORDER) {
    map.set(s, [])
  }
  for (const r of props.risks) {
    const arr = map.get(r.severity)
    if (arr) {
      arr.push(r)
    }
  }
  return ORDER.map((severity) => ({
    severity,
    items: map.get(severity) ?? [],
    ...GROUP_META[severity],
  })).filter((g) => g.items.length > 0)
})

const summary = computed(() => {
  const r = props.risks
  const n = (s: (typeof ORDER)[number]) => r.filter((x) => x.severity === s).length
  return {
    total: r.length,
    high: n('high'),
    medium: n('medium'),
    low: n('low'),
  }
})
</script>

<template>
  <div class="risks">
    <div
      v-if="risks.length"
      class="risks-shell"
    >
      <div
        class="risks-summary"
        role="status"
        aria-live="polite"
      >
        <span class="risks-summary__total">{{ summary.total }} risk{{ summary.total === 1 ? '' : 's' }}</span>
        <span class="risks-summary__dots" aria-hidden="true">
          <span
            v-if="summary.high"
            class="risks-dot risks-dot--high"
          >{{ summary.high }} high</span>
          <span
            v-if="summary.medium"
            class="risks-dot risks-dot--medium"
          >{{ summary.medium }} medium</span>
          <span
            v-if="summary.low"
            class="risks-dot risks-dot--low"
          >{{ summary.low }} low</span>
        </span>
      </div>

      <div
        v-for="group in grouped"
        :key="group.severity"
        class="risk-group"
        :class="'risk-group--' + group.severity"
      >
        <div class="risk-group__head">
          <div class="risk-group__title-row">
            <span
              class="risk-group__marker"
              aria-hidden="true"
            />
            <h4 class="risk-group__title">
              {{ group.title }}
            </h4>
            <span class="risk-group__count">{{ group.items.length }}</span>
          </div>
          <p class="risk-group__hint">
            {{ group.hint }}
          </p>
        </div>

        <ul
          class="risk-group__list"
          :aria-label="group.title + ' items'"
        >
          <li
            v-for="(item, index) in group.items"
            :key="group.severity + '-' + index"
            class="risk-card"
          >
            <div
              class="risk-card__accent"
              aria-hidden="true"
            />
            <div class="risk-card__body">
              <div
                v-if="item.type"
                class="risk-card__type"
              >
                {{ formatLabel(item.type) }}
              </div>
              <p class="risk-card__statement">
                {{ item.risk }}
              </p>
              <div
                v-if="item.mitigation_hint"
                class="risk-card__mitigation"
              >
                <span class="risk-card__mitigation-label">Mitigation</span>
                <p class="risk-card__mitigation-text">
                  {{ item.mitigation_hint }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.risks-shell {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    165deg,
    rgba(18, 22, 20, 0.65) 0%,
    rgba(10, 12, 11, 0.85) 100%
  );
  padding: 20px;
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.04) inset,
    0 24px 48px rgba(0, 0, 0, 0.35);
}

@media (min-width: 640px) {
  .risks-shell {
    padding: 24px;
  }
}

.risks-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.risks-summary__total {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.risks-summary__dots {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.risks-dot {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
}

.risks-dot--high {
  color: var(--severity-high);
  background: rgba(255, 82, 82, 0.08);
  border-color: rgba(255, 82, 82, 0.22);
}

.risks-dot--medium {
  color: var(--severity-medium);
  background: rgba(255, 171, 64, 0.08);
  border-color: rgba(255, 171, 64, 0.22);
}

.risks-dot--low {
  color: var(--severity-low);
  background: rgba(105, 240, 174, 0.08);
  border-color: rgba(105, 240, 174, 0.22);
}

.risk-group {
  margin-bottom: 28px;
}

.risk-group:last-child {
  margin-bottom: 0;
}

.risk-group__head {
  margin-bottom: 14px;
}

.risk-group__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.risk-group__marker {
  width: 4px;
  height: 18px;
  border-radius: 2px;
  flex-shrink: 0;
}

.risk-group--high .risk-group__marker {
  background: linear-gradient(180deg, #ff5252, #c62828);
  box-shadow: 0 0 12px rgba(255, 82, 82, 0.35);
}

.risk-group--medium .risk-group__marker {
  background: linear-gradient(180deg, #ffab40, #e65100);
  box-shadow: 0 0 12px rgba(255, 171, 64, 0.3);
}

.risk-group--low .risk-group__marker {
  background: linear-gradient(180deg, #69f0ae, #00c853);
  box-shadow: 0 0 12px rgba(105, 240, 174, 0.25);
}

.risk-group__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.risk-group__count {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

.risk-group__hint {
  margin: 8px 0 0;
  padding-left: 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
  border-left: 2px solid rgba(255, 255, 255, 0.08);
}

.risk-group__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-card {
  position: relative;
  display: flex;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(8, 10, 9, 0.55);
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.risk-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}

.risk-group--high .risk-card {
  border-color: rgba(255, 82, 82, 0.12);
}

.risk-group--high .risk-card:hover {
  border-color: rgba(255, 82, 82, 0.22);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 82, 82, 0.06);
}

.risk-group--medium .risk-card {
  border-color: rgba(255, 171, 64, 0.12);
}

.risk-group--medium .risk-card:hover {
  border-color: rgba(255, 171, 64, 0.22);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 171, 64, 0.06);
}

.risk-group--low .risk-card {
  border-color: rgba(105, 240, 174, 0.1);
}

.risk-group--low .risk-card:hover {
  border-color: rgba(105, 240, 174, 0.2);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(105, 240, 174, 0.06);
}

.risk-card__accent {
  width: 3px;
  flex-shrink: 0;
  background: var(--border-subtle);
}

.risk-group--high .risk-card__accent {
  background: linear-gradient(180deg, #ff5252 0%, #b71c1c 100%);
}

.risk-group--medium .risk-card__accent {
  background: linear-gradient(180deg, #ffab40 0%, #e65100 100%);
}

.risk-group--low .risk-card__accent {
  background: linear-gradient(180deg, #69f0ae 0%, #2e7d32 100%);
}

.risk-card__body {
  flex: 1;
  min-width: 0;
  padding: 18px 20px 18px 18px;
}

.risk-card__type {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-primary);
  opacity: 0.95;
}

.risk-card__statement {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.55;
  color: var(--text-primary);
}

.risk-card__statement:last-child {
  margin-bottom: 0;
}

.risk-card__mitigation {
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.risk-card__mitigation-label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.risk-card__mitigation-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.risk-card__body:has(.risk-card__mitigation) .risk-card__statement {
  margin-bottom: 0;
}
</style>
