<script setup lang="ts">
import type { CallIntent, OpportunityStage } from '@/domain/opportunity'
import { OPPORTUNITY_STAGES } from '@/domain/opportunity'
import { routeNames } from '@/router/route-names-registry'
import { computed } from 'vue'

const INTENT_HELP
  = 'What this call is mainly about — so you remember the frame. Discovery: fit and pain. Technical: how you’d build it. Negotiation: scope, price, and next steps.'

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) {
    return ''
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const props = defineProps<{
  title: string
  stage: OpportunityStage
  callAt: string | null
  intent: CallIntent | null
  mode: 'prepare' | 'perform'
  callSoonLabel?: string | null
  /** Job posting text for quick context (from saved report). */
  jobPostPreview?: string | null
}>()

const emit = defineEmits<{
  'update:stage': [OpportunityStage]
  'update:callAt': [string | null]
  'update:intent': [CallIntent | null]
  'update:mode': ['prepare' | 'perform']
}>()

const intentOptions: { value: CallIntent, label: string }[] = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'technical', label: 'Technical' },
  { value: 'negotiation', label: 'Negotiation' },
]

const callAtLocal = computed({
  get: () => toDatetimeLocalValue(props.callAt),
  set: (v: string) => {
    if (!v) {
      emit('update:callAt', null)
      return
    }
    const t = Date.parse(v)
    emit('update:callAt', Number.isNaN(t) ? null : new Date(t).toISOString())
  },
})
</script>

<template>
  <header class="opp-head">
    <div class="opp-head__bar">
      <RouterLink
        :to="{ name: routeNames.pipeline }"
        class="opp-head__back"
      >
        <span
          class="opp-head__back-icon"
          aria-hidden="true"
        >←</span>
        Pipeline
      </RouterLink>

      <div
        class="opp-head__modes"
        role="group"
        aria-label="Workspace mode"
      >
        <button
          type="button"
          class="opp-head__mode"
          :class="{ 'is-active': mode === 'prepare' }"
          @click="emit('update:mode', 'prepare')"
        >
          Prepare
        </button>
        <button
          type="button"
          class="opp-head__mode"
          :class="{ 'is-active': mode === 'perform' }"
          @click="emit('update:mode', 'perform')"
        >
          Perform
        </button>
      </div>
    </div>

    <div class="opp-head__title-wrap">
      <h1 class="opp-head__title">
        {{ title }}
      </h1>
      <p
        v-if="jobPostPreview?.trim()"
        class="opp-head__job"
      >
        {{ jobPostPreview }}
      </p>
      <p
        v-if="callSoonLabel"
        class="opp-head__soon"
      >
        {{ callSoonLabel }}
      </p>
    </div>

    <div
      class="opp-head__deck"
      role="group"
      aria-label="Opportunity details"
    >
      <label class="opp-card">
        <span class="opp-card__label">Stage</span>
        <div class="opp-card__input-wrap">
          <select
            class="opp-card__select"
            :value="stage"
            @change="emit('update:stage', ($event.target as HTMLSelectElement).value as OpportunityStage)"
          >
            <option
              v-for="o in OPPORTUNITY_STAGES"
              :key="o.value"
              :value="o.value"
            >
              {{ o.label }}
            </option>
          </select>
        </div>
      </label>

      <label class="opp-card">
        <span class="opp-card__label">Call time</span>
        <div class="opp-card__input-wrap">
          <input
            v-model="callAtLocal"
            type="datetime-local"
            class="opp-card__input"
          >
        </div>
      </label>

      <label class="opp-card">
        <span class="opp-card__label-row">
          <span class="opp-card__label">Call intent</span>
          <el-tooltip
            :content="INTENT_HELP"
            placement="top"
            :show-after="250"
          >
            <button
              type="button"
              class="opp-card__hint"
              aria-label="What is call intent?"
            >
              ?
            </button>
          </el-tooltip>
        </span>
        <div class="opp-card__input-wrap">
          <select
            class="opp-card__select"
            :value="intent ?? ''"
            @change="emit('update:intent', (($event.target as HTMLSelectElement).value || null) as CallIntent | null)"
          >
            <option value="">
              Not set
            </option>
            <option
              v-for="o in intentOptions"
              :key="o.value"
              :value="o.value"
            >
              {{ o.label }}
            </option>
          </select>
        </div>
      </label>
    </div>
  </header>
</template>

<style scoped>
.opp-head {
  max-width: 1280px;
  margin: 0 auto var(--space-6);
  padding: 0 var(--space-4);
}

.opp-head__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.opp-head__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.14);
  background: rgba(0, 230, 118, 0.04);
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.opp-head__back:hover {
  color: var(--accent-primary);
  border-color: rgba(0, 230, 118, 0.35);
  background: rgba(0, 230, 118, 0.08);
}

.opp-head__back-icon {
  opacity: 0.85;
  font-size: 14px;
}

.opp-head__title-wrap {
  margin-bottom: var(--space-5);
}

.opp-head__title {
  margin: 0;
  font-size: clamp(1.35rem, 2.8vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.25;
  padding-top: 2px;
}

.opp-head__job {
  margin: var(--space-2) 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: min(720px, 100%);
}

.opp-head__soon {
  margin: var(--space-2) 0 0;
  font-size: 13px;
  color: var(--accent-primary);
  font-weight: 600;
}

.opp-head__modes {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: linear-gradient(145deg, rgba(12, 18, 15, 0.95), rgba(8, 11, 10, 0.98));
  border: 1px solid rgba(0, 230, 118, 0.22);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35) inset,
    0 8px 28px rgba(0, 0, 0, 0.35);
}

.opp-head__mode {
  padding: var(--space-2) var(--space-5);
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.opp-head__mode.is-active {
  color: var(--accent-primary);
  background: rgba(0, 230, 118, 0.14);
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.12);
}

.opp-head__deck {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

@media (max-width: 900px) {
  .opp-head__deck {
    grid-template-columns: 1fr;
  }
}

.opp-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-4);
  border-radius: 14px;
  background: linear-gradient(
    160deg,
    rgba(18, 26, 22, 0.92) 0%,
    rgba(10, 14, 12, 0.96) 100%
  );
  border: 1px solid rgba(0, 230, 118, 0.16);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35) inset,
    0 12px 40px rgba(0, 0, 0, 0.28);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.opp-card:hover {
  border-color: rgba(0, 230, 118, 0.28);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35) inset,
    0 14px 44px rgba(0, 0, 0, 0.32),
    0 0 40px rgba(0, 230, 118, 0.06);
}

.opp-card:focus-within {
  border-color: rgba(0, 230, 118, 0.4);
}

.opp-card__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(0, 230, 118, 0.65);
}

.opp-card__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.opp-card__hint {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgba(0, 230, 118, 0.3);
  background: rgba(0, 230, 118, 0.08);
  color: var(--accent-primary);
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  line-height: 1;
  cursor: help;
}

.opp-card__hint:hover {
  background: rgba(0, 230, 118, 0.14);
}

.opp-card__hint:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.opp-card__input-wrap {
  position: relative;
}

.opp-card__input-wrap::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  width: 0;
  height: 0;
  margin-top: -2px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid rgba(0, 230, 118, 0.45);
  pointer-events: none;
  opacity: 0;
}

.opp-card:has(.opp-card__select) .opp-card__input-wrap::after {
  opacity: 1;
}

.opp-card__select,
.opp-card__input {
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: 10px 36px 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 230, 118, 0.18);
  background: rgba(6, 9, 8, 0.65);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.3;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.opp-card__select {
  appearance: none;
  cursor: pointer;
}

.opp-card__input {
  padding-right: 14px;
}

.opp-card__input::-webkit-calendar-picker-indicator {
  filter: invert(0.75) opacity(0.75);
  cursor: pointer;
}

.opp-card__select:hover,
.opp-card__input:hover {
  border-color: rgba(0, 230, 118, 0.32);
}

.opp-card__select:focus,
.opp-card__input:focus {
  outline: none;
  border-color: rgba(0, 230, 118, 0.55);
  box-shadow: 0 0 0 3px rgba(0, 230, 118, 0.12);
}

@media (max-width: 640px) {
  .opp-head__modes {
    width: 100%;
    justify-content: stretch;
  }

  .opp-head__mode {
    flex: 1;
    text-align: center;
  }
}
</style>
