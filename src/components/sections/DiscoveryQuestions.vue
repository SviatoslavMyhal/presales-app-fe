<script setup lang="ts">
import type { DiscoveryQuestion as DiscoveryQuestionType } from '@/types/presales'
import { formatLabel } from '@/utils/formatLabel'
import { computed, ref, useId, watch } from 'vue'

const props = defineProps<{
  questions: DiscoveryQuestionType[]
}>()

const uid = useId()
const sunGlowId = `discovery-sun-${uid}`
const softGlowId = `discovery-glow-${uid}`

const selectedIndex = ref<number | null>(null)

watch(
  () => props.questions,
  (list) => {
    if (!list.length) {
      selectedIndex.value = null
      return
    }
    if (
      selectedIndex.value === null
      || selectedIndex.value >= list.length
    ) {
      selectedIndex.value = 0
    }
  },
  { immediate: true },
)

const selected = computed(() => {
  if (
    selectedIndex.value === null
    || !props.questions[selectedIndex.value]
  ) {
    return null
  }
  return props.questions[selectedIndex.value]
})

function selectPlanet(index: number) {
  selectedIndex.value = index
}

function handlePrev() {
  const n = props.questions.length
  if (n === 0 || selectedIndex.value === null) {
    return
  }
  const next = (selectedIndex.value - 1 + n) % n
  selectedIndex.value = next
}

function handleNext() {
  const n = props.questions.length
  if (n === 0 || selectedIndex.value === null) {
    return
  }
  const next = (selectedIndex.value + 1) % n
  selectedIndex.value = next
}

function planetPosition(index: number, total: number) {
  if (total <= 0) {
    return { x: 50, y: 50 }
  }
  const start = -Math.PI / 2
  const step = (2 * Math.PI) / total
  const angle = start + step * index
  const r = 36
  return {
    x: 50 + r * Math.cos(angle),
    y: 50 + r * Math.sin(angle),
  }
}
</script>

<template>
  <div class="discovery-orbit">
    <div
      v-if="questions.length"
      class="orbit-layout"
    >
      <div class="orbit-stage">
        <p class="orbit-hint">
          Orbit — tap a node to read the full prompt
        </p>
        <div class="orbit-frame">
          <svg
            class="orbit-svg"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient
                :id="sunGlowId"
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop
                  offset="0%"
                  stop-color="var(--accent-primary)"
                  stop-opacity="0.45"
                />
                <stop
                  offset="55%"
                  stop-color="var(--accent-primary)"
                  stop-opacity="0.15"
                />
                <stop
                  offset="100%"
                  stop-color="var(--bg-base)"
                  stop-opacity="0"
                />
              </radialGradient>
              <filter
                :id="softGlowId"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feGaussianBlur
                  stdDeviation="2"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <!-- Rotating orbit rings (outer g = center; inner g = CSS rotate so translate is preserved) -->
            <g transform="translate(100 100)">
              <g class="orbit-spin orbit-spin--slow">
                <circle
                  class="ring ring--outer"
                  cx="0"
                  cy="0"
                  r="78"
                  fill="none"
                />
              </g>
            </g>
            <g transform="translate(100 100)">
              <g class="orbit-spin orbit-spin--med">
                <circle
                  class="ring ring--mid"
                  cx="0"
                  cy="0"
                  r="58"
                  fill="none"
                />
              </g>
            </g>
            <g transform="translate(100 100)">
              <g class="orbit-spin orbit-spin--fast">
                <circle
                  class="ring ring--inner"
                  cx="0"
                  cy="0"
                  r="38"
                  fill="none"
                />
              </g>
            </g>

            <!-- Sun -->
            <circle
              cx="100"
              cy="100"
              r="18"
              :fill="`url(#${sunGlowId})`"
              :filter="`url(#${softGlowId})`"
              class="sun-core"
            />
            <text
              x="100"
              y="104"
              text-anchor="middle"
              class="sun-label"
            >?</text>
          </svg>

          <!-- Planet buttons (DOM for click + a11y) -->
          <div class="planet-layer">
            <button
              v-for="(item, index) in questions"
              :key="index"
              type="button"
              class="planet"
              :class="{ 'planet--active': selectedIndex === index }"
              :style="{
                left: planetPosition(index, questions.length).x + '%',
                top: planetPosition(index, questions.length).y + '%'
              }"
              :aria-selected="selectedIndex === index"
              :aria-label="`Question ${index + 1}: ${item.question.slice(0, 80)}`"
              @click="selectPlanet(index)"
            >
              <span class="planet-dot" />
              <span class="planet-idx">{{ index + 1 }}</span>
            </button>
          </div>
        </div>
      </div>

      <aside
        class="discovery-detail"
        aria-live="polite"
      >
        <div
          v-if="selected"
          class="discovery-detail__stack"
        >
          <div class="discovery-detail__inner">
            <div class="discovery-detail__head">
              <span
                v-if="selected.category"
                class="discovery-badge"
              >{{ formatLabel(selected.category) }}</span>
              <span
                v-else
                class="discovery-badge discovery-badge--muted"
              >Discovery</span>
              <span class="discovery-detail__step">Node {{ (selectedIndex ?? 0) + 1 }} / {{ questions.length }}</span>
            </div>
            <h4 class="discovery-detail__question">
              {{ selected.question }}
            </h4>
            <p
              v-if="selected.why_it_matters"
              class="discovery-detail__why"
            >
              {{ selected.why_it_matters }}
            </p>
          </div>
          <nav
            class="discovery-detail__nav"
            aria-label="Discovery questions"
          >
            <button
              type="button"
              class="discovery-nav-btn"
              aria-label="Previous discovery question"
              @click.stop="handlePrev"
            >
              <svg
                class="discovery-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Previous</span>
            </button>
            <button
              type="button"
              class="discovery-nav-btn discovery-nav-btn--next"
              aria-label="Next discovery question"
              @click.stop="handleNext"
            >
              <span>Next</span>
              <svg
                class="discovery-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </nav>
        </div>
      </aside>
    </div>

    <p
      v-else
      class="discovery-empty"
    >
      No discovery questions in this report.
    </p>
  </div>
</template>

<style scoped src="@/assets/styles/discovery-questions.css"></style>
