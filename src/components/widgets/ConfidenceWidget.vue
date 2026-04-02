<script setup lang="ts">
import type { ConfidenceData } from '@/types/presales'
import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    data: ConfidenceData
    section?: 'full' | 'score' | 'reasons'
  }>(),
  { section: 'full' },
)

const showScore = () => props.section === 'full' || props.section === 'score'
const showReasons = () => props.section === 'full' || props.section === 'reasons'

const circumference = Math.PI * 54

const colorMap = {
  green: {
    stroke: 'var(--accent-primary)',
    badgeBg: 'var(--accent-subtle)',
    badgeBorder: 'var(--accent-border)',
    badgeText: 'var(--accent-primary)',
  },
  amber: {
    stroke: 'var(--severity-medium)',
    badgeBg: 'rgba(255, 171, 64, 0.1)',
    badgeBorder: 'rgba(255, 171, 64, 0.25)',
    badgeText: 'var(--severity-medium)',
  },
  red: {
    stroke: 'var(--severity-high)',
    badgeBg: 'rgba(255, 82, 82, 0.1)',
    badgeBorder: 'rgba(255, 82, 82, 0.25)',
    badgeText: 'var(--severity-high)',
  },
} as const

const scoreColor = computed(
  () => colorMap[props.data.color]?.stroke ?? 'var(--text-secondary)',
)

const badgeStyle = computed(() => {
  const c = colorMap[props.data.color]
  if (!c) {
    return {}
  }
  return {
    background: c.badgeBg,
    borderColor: c.badgeBorder,
    color: c.badgeText,
  }
})

const dashOffset = computed(() => {
  const clamped = Math.max(0, Math.min(10, props.data.score))
  return circumference - (clamped / 10) * circumference
})

const animatedOffset = ref(circumference)

function runArcAnimation() {
  animatedOffset.value = circumference
  setTimeout(() => {
    animatedOffset.value = dashOffset.value
  }, 100)
}

onMounted(() => {
  runArcAnimation()
})

watch(
  () => props.data.score,
  () => {
    runArcAnimation()
  },
)
</script>

<template>
  <div
    class="confidence-widget widget-card"
    :class="{
      'confidence-widget--score-only': section === 'score',
      'confidence-widget--reasons-only': section === 'reasons',
    }"
  >
    <template v-if="showScore()">
      <div class="confidence-head">
        <span class="confidence-label">Confidence Score</span>
        <div class="confidence-score-row">
          <span
            class="score-value"
            :style="{ color: scoreColor }"
          >{{ props.data.score.toFixed(1) }}</span>
          <span class="score-denom">/10</span>
        </div>
      </div>
      <div class="gauge-wrap">
        <svg
          class="gauge-svg"
          viewBox="0 0 120 60"
          aria-hidden="true"
        >
          <path
            class="gauge-track"
            d="M 6 54 A 54 54 0 0 1 114 54"
            fill="none"
            stroke="var(--border-subtle)"
            stroke-width="6"
            stroke-linecap="round"
          />
          <path
            class="gauge-arc"
            d="M 6 54 A 54 54 0 0 1 114 54"
            fill="none"
            :stroke="scoreColor"
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="`${circumference} ${circumference}`"
            :stroke-dashoffset="animatedOffset"
          />
        </svg>
      </div>
      <div class="badge-row">
        <div
          class="score-badge"
          :style="badgeStyle"
        >
          {{ props.data.label }}
        </div>
      </div>
    </template>
    <template v-if="showReasons() && props.data.reasons.length">
      <p
        v-if="section === 'reasons'"
        class="split-kicker"
      >
        Key takeaways
      </p>
      <ul
        class="reasons"
        :class="{ 'reasons--alone': section === 'reasons' }"
      >
        <li
          v-for="(r, i) in props.data.reasons"
          :key="i"
          class="reason-item"
        >
          · {{ r }}
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.confidence-widget {
  padding: var(--space-6);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 1px 0 0 var(--border-subtle);
}

.confidence-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-5);
  gap: var(--space-4);
}

.confidence-label {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.confidence-score-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.score-denom {
  font-size: 16px;
  color: var(--text-muted);
}

.gauge-wrap {
  display: flex;
  justify-content: center;
  padding: var(--space-2) 0 var(--space-5);
}

.gauge-svg {
  width: 120px;
  height: 80px;
}

.gauge-arc {
  transition: stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.badge-row {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-5);
}

.score-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  font-size: 12px;
  font-weight: 600;
}

.reasons {
  margin: var(--space-5) 0 0;
  padding: var(--space-5) 0 0;
  list-style: none;
  border-top: 1px solid var(--border-subtle);
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reason-item {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.65;
  padding: 0 var(--space-1);
}

.reasons--alone {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.confidence-widget--reasons-only {
  justify-content: flex-start;
}

.confidence-widget--score-only .badge-row {
  margin-bottom: 0;
}

.confidence-widget--score-only .gauge-wrap {
  padding-bottom: var(--space-3);
}
</style>
