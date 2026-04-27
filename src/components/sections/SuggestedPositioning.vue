<script setup lang="ts">
import type { PositioningStatement } from '@/types/presales'
import { formatLabel } from '@/utils/formatLabel'
import { computed } from 'vue'

const props = defineProps<{
  positioning: PositioningStatement[]
}>()

/** Preferred narrative order for common angles (unknown keys sort last, alphabetically). */
const ANGLE_ORDER = [
  'expertise',
  'domain_fit',
  'trust',
  'process',
  'risk_mitigation',
  'speed',
] as const

function normalizeAngle(angle: string | undefined): string {
  return (angle || 'general').toLowerCase().replace(/\s+/g, '_')
}

function sortAngleKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = (ANGLE_ORDER as readonly string[]).indexOf(a)
    const ib = (ANGLE_ORDER as readonly string[]).indexOf(b)
    if (ia === -1 && ib === -1) {
      return a.localeCompare(b)
    }
    if (ia === -1) {
      return 1
    }
    if (ib === -1) {
      return -1
    }
    return ia - ib
  })
}

const grouped = computed(() => {
  const map = new Map<string, PositioningStatement[]>()
  for (const p of props.positioning) {
    const k = normalizeAngle(p.angle)
    if (!map.has(k)) {
      map.set(k, [])
    }
    map.get(k)!.push(p)
  }
  return sortAngleKeys([...map.keys()]).map((angleKey) => {
    const items = map.get(angleKey)!
    const label = formatLabel(items[0]?.angle || angleKey)
    return {
      angleKey,
      label,
      items,
      multi: items.length > 1,
    }
  })
})

const summary = computed(() => ({
  statements: props.positioning.length,
  themes: grouped.value.length,
}))
</script>

<template>
  <div class="positioning">
    <div
      v-if="positioning.length"
      class="positioning-shell"
    >
      <div
        class="positioning-summary"
        role="status"
        aria-live="polite"
      >
        <span class="positioning-summary__lead">
          {{ summary.statements }} positioning
          {{ summary.statements === 1 ? 'statement' : 'statements' }}
        </span>
        <span
          v-if="summary.themes > 1"
          class="positioning-summary__meta"
        >
          · {{ summary.themes }} themes
        </span>
      </div>

      <div class="positioning-groups">
        <section
          v-for="group in grouped"
          :key="group.angleKey"
          class="pos-group"
          :class="'pos-group--' + group.angleKey"
        >
          <header
            v-if="group.multi"
            class="pos-group__head"
          >
            <span
              class="pos-group__marker"
              aria-hidden="true"
            />
            <h4 class="pos-group__title">
              {{ group.label }}
            </h4>
            <span class="pos-group__count">{{ group.items.length }}</span>
          </header>

          <ul
            class="pos-group__list"
            :aria-label="group.multi ? group.label : undefined"
          >
            <li
              v-for="(item, index) in group.items"
              :key="index"
              class="pos-card"
              :class="'pos-card--' + group.angleKey"
            >
              <div
                class="pos-card__accent"
                aria-hidden="true"
              />
              <div class="pos-card__body">
                <div
                  v-if="!group.multi && item.angle"
                  class="pos-card__angle"
                >
                  {{ formatLabel(item.angle) }}
                </div>
                <p class="pos-card__statement">
                  {{ item.statement }}
                </p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.positioning-shell {
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
  .positioning-shell {
    padding: 24px;
  }
}

.positioning-summary {
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.positioning-summary__lead {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.positioning-summary__meta {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.positioning-groups {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.pos-group {
  margin: 0;
}

.pos-group__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.pos-group__marker {
  width: 4px;
  height: 18px;
  border-radius: 2px;
  flex-shrink: 0;
  background: var(--accent-primary);
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.35);
}

.pos-group--expertise .pos-group__marker,
.pos-group--domain_fit .pos-group__marker {
  background: linear-gradient(180deg, #00e676, #00897b);
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.35);
}

.pos-group--process .pos-group__marker {
  background: linear-gradient(180deg, #4dd0e1, #00838f);
  box-shadow: 0 0 12px rgba(77, 208, 225, 0.3);
}

.pos-group--trust .pos-group__marker {
  background: linear-gradient(180deg, #90caf9, #1565c0);
  box-shadow: 0 0 12px rgba(144, 202, 249, 0.28);
}

.pos-group--speed .pos-group__marker,
.pos-group--risk_mitigation .pos-group__marker {
  background: linear-gradient(180deg, #ffab40, #e65100);
  box-shadow: 0 0 12px rgba(255, 171, 64, 0.3);
}

.pos-group__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.pos-group__count {
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

.pos-group__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pos-card {
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

.pos-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}

.pos-card__accent {
  width: 3px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--accent-primary), #00695c);
}

.pos-card--expertise .pos-card__accent,
.pos-card--domain_fit .pos-card__accent {
  background: linear-gradient(180deg, #00e676 0%, #004d40 100%);
}

.pos-card--process .pos-card__accent {
  background: linear-gradient(180deg, #4dd0e1 0%, #006064 100%);
}

.pos-card--trust .pos-card__accent {
  background: linear-gradient(180deg, #90caf9 0%, #0d47a1 100%);
}

.pos-card--speed .pos-card__accent,
.pos-card--risk_mitigation .pos-card__accent {
  background: linear-gradient(180deg, #ffab40 0%, #bf360c 100%);
}

.pos-card--expertise,
.pos-card--domain_fit {
  border-color: rgba(0, 230, 118, 0.12);
}

.pos-card--expertise:hover,
.pos-card--domain_fit:hover {
  border-color: rgba(0, 230, 118, 0.22);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(0, 230, 118, 0.06);
}

.pos-card--process {
  border-color: rgba(77, 208, 225, 0.14);
}

.pos-card--process:hover {
  border-color: rgba(77, 208, 225, 0.24);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(77, 208, 225, 0.08);
}

.pos-card--trust {
  border-color: rgba(144, 202, 249, 0.14);
}

.pos-card--trust:hover {
  border-color: rgba(144, 202, 249, 0.24);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(144, 202, 249, 0.08);
}

.pos-card--speed,
.pos-card--risk_mitigation {
  border-color: rgba(255, 171, 64, 0.14);
}

.pos-card--speed:hover,
.pos-card--risk_mitigation:hover {
  border-color: rgba(255, 171, 64, 0.24);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 171, 64, 0.08);
}

.pos-card__body {
  flex: 1;
  min-width: 0;
  padding: 18px 20px 18px 18px;
}

.pos-card__angle {
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-primary);
  opacity: 0.95;
}

.pos-card--process .pos-card__angle {
  color: #4dd0e1;
}

.pos-card--trust .pos-card__angle {
  color: #90caf9;
}

.pos-card--speed .pos-card__angle,
.pos-card--risk_mitigation .pos-card__angle {
  color: var(--severity-medium);
}

.pos-card__statement {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 500;
  color: var(--text-primary);
}
</style>
