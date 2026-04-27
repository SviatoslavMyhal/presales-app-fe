<script setup lang="ts">
import type { CallStrategy as CallStrategyType } from '@/types/presales'
import { formatLabel } from '@/utils/formatLabel'

defineProps<{
  strategy: CallStrategyType
}>()
</script>

<template>
  <div class="call-strategy">
    <h3 class="sr-only">
      Call strategy
    </h3>

    <div
      class="call-strategy__aurora"
      aria-hidden="true"
    />

    <div
      v-if="strategy.primary_goal"
      class="mission-hero"
    >
      <div class="mission-hero__frame">
        <p class="mission-hero__eyebrow">
          Primary goal
        </p>
        <p class="mission-hero__text">
          {{ strategy.primary_goal }}
        </p>
      </div>
    </div>

    <!-- Tone: full-width editorial strip (not a corner tile + pill) -->
    <div
      v-if="strategy.tone"
      class="tone-strip"
    >
      <div
        class="tone-strip__accent"
        aria-hidden="true"
      />
      <div class="tone-strip__inner">
        <div class="tone-strip__meta">
          <span class="tone-strip__kicker">How you show up</span>
        </div>
        <p class="tone-strip__value">
          {{ formatLabel(strategy.tone) }}
        </p>
      </div>
    </div>

    <div
      v-if="strategy.desired_outcome"
      class="outcome-panel"
    >
      <div class="outcome-panel__head">
        <span
          class="outcome-panel__icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v6l4 2"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
            />
          </svg>
        </span>
        <span class="outcome-panel__label">Desired outcome</span>
      </div>
      <p class="outcome-panel__body">
        {{ strategy.desired_outcome }}
      </p>
    </div>

    <!-- Focus areas: bento-style grid (no vertical timeline) -->
    <div
      v-if="strategy.focus_areas?.length"
      class="focus-bento"
    >
      <div class="focus-bento__head">
        <h4 class="focus-bento__title">
          Focus areas
        </h4>
        <span class="focus-bento__subtitle">What to keep in orbit</span>
      </div>
      <ul class="focus-bento__grid">
        <li
          v-for="(area, index) in strategy.focus_areas"
          :key="index"
          class="focus-card"
          :style="{ '--i': index }"
        >
          <span class="focus-card__idx">{{ String(index + 1).padStart(2, '0') }}</span>
          <p class="focus-card__text">
            {{ formatLabel(area) }}
          </p>
        </li>
      </ul>
    </div>

    <!-- Lead questions: 2-up grid (all visible; no carousel) -->
    <div
      v-if="strategy.questions_to_lead_with?.length"
      class="lead-grid"
    >
      <div class="lead-grid__head">
        <h4 class="lead-grid__title">
          Questions to lead with
        </h4>
        <span class="lead-grid__count">{{ strategy.questions_to_lead_with.length }} questions</span>
      </div>
      <ul class="lead-grid__list">
        <li
          v-for="(item, index) in strategy.questions_to_lead_with"
          :key="index"
          class="lead-card"
        >
          <span class="lead-card__tag">Lead with</span>
          <p class="lead-card__q">
            {{ item.question }}
          </p>
          <p
            v-if="item.reason"
            class="lead-card__why"
          >
            {{ item.reason }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.call-strategy {
  position: relative;
  min-width: 0;
  padding: 4px;
}

.call-strategy__aurora {
  pointer-events: none;
  position: absolute;
  inset: -12px -8px auto;
  height: 180px;
  border-radius: 12px;
  background:
    radial-gradient(ellipse 80% 60% at 15% 20%, rgba(0, 230, 118, 0.12), transparent 55%),
    radial-gradient(ellipse 50% 40% at 85% 60%, rgba(0, 188, 212, 0.08), transparent 50%);
  opacity: 0.85;
  z-index: 0;
}

.call-strategy > :not(.call-strategy__aurora) {
  position: relative;
  z-index: 1;
}

.mission-hero {
  margin-bottom: 20px;
}

.mission-hero__frame {
  position: relative;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background:
    linear-gradient(145deg, rgba(22, 29, 23, 0.95) 0%, rgba(12, 16, 14, 0.98) 100%);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.06) inset,
    0 12px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.mission-hero__frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-brand);
  opacity: 0.9;
}

.mission-hero__frame::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 55%;
  height: 120%;
  background: radial-gradient(circle, rgba(0, 230, 118, 0.07) 0%, transparent 65%);
  pointer-events: none;
}

.mission-hero__eyebrow {
  margin: 0 0 12px;
  font-size: 11px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.mission-hero__text {
  margin: 0;
  font-size: 17px;
  line-height: 1.55;
  font-weight: 500;
  color: var(--text-primary);
}

/* --- Tone strip --- */
.tone-strip {
  display: flex;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 230, 118, 0.14);
  background: linear-gradient(
    118deg,
    rgba(0, 230, 118, 0.06) 0%,
    rgba(12, 16, 14, 0.92) 42%,
    rgba(10, 12, 11, 0.96) 100%
  );
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.05) inset,
    0 16px 40px rgba(0, 0, 0, 0.28);
}

.tone-strip__accent {
  width: 5px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #00e676 0%, #00695c 100%);
  box-shadow: 0 0 24px rgba(0, 230, 118, 0.35);
}

.tone-strip__inner {
  flex: 1;
  min-width: 0;
  padding: 18px 20px 20px 18px;
}

.tone-strip__meta {
  margin-bottom: 8px;
}

.tone-strip__kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: var(--font-mono);
  color: var(--accent-primary);
  opacity: 0.95;
}

.tone-strip__value {
  margin: 0;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.tone-strip__hint {
  margin: 0;
  max-width: 42rem;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* --- Outcome --- */
.outcome-panel {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 20, 16, 0.55);
  box-shadow: 0 0 0 1px rgba(0, 230, 118, 0.04) inset;
}

.outcome-panel__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.outcome-panel__icon {
  display: flex;
  color: var(--accent-primary);
  opacity: 0.85;
}

.outcome-panel__label {
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.outcome-panel__body {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
}

/* --- Focus bento --- */
.focus-bento {
  margin-bottom: 24px;
}

.focus-bento__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 16px;
  margin-bottom: 14px;
}

.focus-bento__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.focus-bento__subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.85;
}

.focus-bento__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.focus-card {
  position: relative;
  margin: 0;
  padding: 16px 18px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(8, 10, 9, 0.55);
  overflow: hidden;
  opacity: 0;
  animation: focus-card-in 0.4s ease forwards;
  animation-delay: calc(var(--i, 0) * 0.05s);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.focus-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 230, 118, 0.45), transparent);
  opacity: 0.85;
}

.focus-card:hover {
  border-color: rgba(0, 230, 118, 0.22);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}

@keyframes focus-card-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .focus-card {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

.focus-card__idx {
  display: block;
  margin-bottom: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent-primary);
  opacity: 0.9;
}

.focus-card__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 500;
  color: var(--text-primary);
}

/* --- Lead questions: 2 columns when space allows --- */
.lead-grid {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 20, 16, 0.5);
  padding: 20px;
  box-shadow: 0 0 0 1px rgba(0, 230, 118, 0.04) inset;
}

@media (min-width: 640px) {
  .lead-grid {
    padding: 24px;
  }
}

.lead-grid__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}

.lead-grid__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.lead-grid__count {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}

.lead-grid__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 560px) {
  .lead-grid__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

.lead-card {
  margin: 0;
  padding: 16px 18px 18px;
  border-radius: 10px;
  border: 1px solid rgba(0, 230, 118, 0.18);
  background: linear-gradient(
    165deg,
    rgba(0, 230, 118, 0.06) 0%,
    rgba(8, 11, 10, 0.94) 48%
  );
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.lead-card:hover {
  border-color: rgba(0, 230, 118, 0.28);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
}

.lead-card__tag {
  display: block;
  font-size: 10px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--accent-primary);
  font-weight: 700;
  margin-bottom: 10px;
}

.lead-card__q {
  margin: 0 0 10px;
  font-size: 15px;
  line-height: 1.45;
  font-weight: 600;
  color: var(--text-primary);
}

.lead-card__why {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}
</style>
