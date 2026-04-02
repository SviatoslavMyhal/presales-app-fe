<script setup lang="ts">
import type { SuggestedPitchData } from '@/types/presales'

const props = withDefaults(
  defineProps<{
    data: SuggestedPitchData
    section?: 'full' | 'opening' | 'rest'
  }>(),
  { section: 'full' },
)

const showOpening = () =>
  props.section === 'full' || props.section === 'opening'
const showRest = () =>
  props.section === 'full' || props.section === 'rest'
</script>

<template>
  <div
    class="pitch-widget widget-card"
    :class="{
      'pitch-widget--opening-only': section === 'opening',
      'pitch-widget--rest-only': section === 'rest',
    }"
  >
    <template v-if="showOpening()">
      <div class="pitch-block">
        <span class="pitch-label">Say this first</span>
        <p class="pitch-text opening">
          {{ props.data.opening }}
        </p>
      </div>
    </template>
    <template v-if="showRest()">
      <div class="pitch-block">
        <span class="pitch-label">Your edge</span>
        <p class="pitch-text differentiator">
          {{ props.data.differentiator }}
        </p>
      </div>
      <div class="pitch-block pitch-block--hook-wrap">
        <span class="pitch-label">Close with</span>
        <p class="pitch-text hook">
          {{ props.data.hook }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pitch-widget {
  padding: var(--space-6);
  background: var(--gradient-brand-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  box-shadow: inset 0 1px 0 0 var(--border-subtle);
}

.pitch-block {
  margin: 0;
}

.pitch-block--hook-wrap {
  margin: 0;
}

.pitch-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--accent-muted);
  font-weight: 600;
  display: block;
  margin-bottom: var(--space-2);
}

.pitch-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  padding-left: var(--space-3);
  border-left-width: 3px;
  border-left-style: solid;
  margin: 0;
}

.pitch-text.opening {
  border-color: var(--accent-primary);
  font-style: italic;
}

.pitch-text.differentiator {
  border-color: var(--accent-muted);
}

.pitch-text.hook {
  border-color: var(--accent-secondary);
  font-weight: 600;
  background: rgba(0, 230, 118, 0.04);
  padding: var(--space-2) var(--space-3);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.pitch-widget--opening-only {
  justify-content: flex-start;
}

.pitch-widget--rest-only {
  gap: var(--space-5);
}
</style>
