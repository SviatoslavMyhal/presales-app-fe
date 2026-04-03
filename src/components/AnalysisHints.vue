<script setup lang="ts">
import { ANALYSIS_HINTS, type AnalysisHintEntry } from '@/data/analysisHints'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const HINT_ROTATE_MS = 8000

let lastHintIndex = -1

function pickRandomHintIndex (): number {
  const n = ANALYSIS_HINTS.length
  if (n <= 1) {
    return 0
  }
  let next = 0
  do {
    next = Math.floor(Math.random() * n)
  } while (next === lastHintIndex)
  lastHintIndex = next
  return next
}

const hintIndex = ref(0)
let hintIntervalId: ReturnType<typeof setInterval> | null = null

const currentHint = computed((): AnalysisHintEntry => {
  const i = hintIndex.value
  return ANALYSIS_HINTS[i] ?? ANALYSIS_HINTS[0]!
})

function hintEmoji (kind: AnalysisHintEntry['kind']): string {
  return kind === 'tip' ? '💡' : '✨'
}

function clearHintInterval () {
  if (hintIntervalId !== null) {
    clearInterval(hintIntervalId)
    hintIntervalId = null
  }
}

onMounted(() => {
  hintIndex.value = pickRandomHintIndex()
  hintIntervalId = setInterval(() => {
    hintIndex.value = pickRandomHintIndex()
  }, HINT_ROTATE_MS)
})

onUnmounted(() => {
  clearHintInterval()
})
</script>

<template>
  <Transition name="analysis-hint">
    <div
      :key="hintIndex"
      class="analysis-hint"
      role="status"
      aria-live="polite"
    >
      <div
        class="analysis-hint__glow"
        aria-hidden="true"
      />
      <div class="analysis-hint__row">
        <div class="analysis-hint__text">
          <span
            class="analysis-hint__kicker"
            :class="`analysis-hint__kicker--${currentHint.kind}`"
          >
            <span class="analysis-hint__emoji">{{ hintEmoji(currentHint.kind) }}</span>
            {{ currentHint.label }}
          </span>
          <p class="analysis-hint__body">
            {{ currentHint.body }}
          </p>
        </div>
        <div
          class="analysis-hint__icon-wrap"
          :class="`analysis-hint__icon-wrap--${currentHint.kind}`"
          aria-hidden="true"
        >
          <svg
            v-if="currentHint.kind === 'tip'"
            class="analysis-hint__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
          <svg
            v-else
            class="analysis-hint__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped src="@/assets/styles/analysis-hints.css"></style>
