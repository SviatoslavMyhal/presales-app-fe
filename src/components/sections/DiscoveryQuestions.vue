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
      selectedIndex.value === null ||
      selectedIndex.value >= list.length
    ) {
      selectedIndex.value = 0
    }
  },
  { immediate: true }
)

const selected = computed(() => {
  if (
    selectedIndex.value === null ||
    !props.questions[selectedIndex.value]
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
    y: 50 + r * Math.sin(angle)
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

<style scoped>
.discovery-orbit {
  width: 100%;
  min-width: 0;
}

.orbit-layout {
  position: relative;
  z-index: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: var(--space-6);
  align-items: start;
}

.orbit-hint {
  margin: 0 0 var(--space-4);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.orbit-stage {
  position: relative;
}

.orbit-frame {
  position: relative;
  z-index: 0;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  aspect-ratio: 1;
}

.orbit-svg {
  width: 100%;
  height: auto;
  display: block;
}

.sun-core {
  animation: sun-pulse 4s ease-in-out infinite;
}

.sun-label {
  font-size: 14px;
  font-weight: 700;
  fill: var(--accent-primary);
  pointer-events: none;
}

.ring {
  stroke: var(--border-subtle);
  stroke-width: 1;
  stroke-dasharray: 4 8;
  opacity: 0.85;
}

.ring--outer {
  stroke-width: 0.8;
  opacity: 0.5;
}

.ring--mid {
  stroke-dasharray: 2 6;
}

.ring--inner {
  stroke-dasharray: 1 5;
  opacity: 0.65;
}

.orbit-spin {
  transform-origin: 0 0;
}

.orbit-spin--slow {
  animation: orbit-rotate 140s linear infinite;
}

.orbit-spin--med {
  animation: orbit-rotate 95s linear infinite reverse;
}

.orbit-spin--fast {
  animation: orbit-rotate 55s linear infinite;
}

@keyframes orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes sun-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.88;
  }
}

.planet-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.planet {
  position: absolute;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition:
    transform var(--transition-fast),
    filter var(--transition-fast);
}

.planet:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
  border-radius: var(--radius-md);
}

.planet:hover .planet-dot {
  transform: scale(1.12);
  box-shadow: 0 0 16px var(--accent-border);
}

.planet--active .planet-dot {
  background: var(--gradient-brand);
  box-shadow:
    0 0 0 2px var(--bg-surface),
    0 0 18px var(--accent-border);
  transform: scale(1.08);
}

.planet-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 2px solid var(--accent-border);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background var(--transition-fast);
}

.planet-idx {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.planet--active .planet-idx {
  color: var(--accent-primary);
}

.discovery-detail {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  min-height: 12rem;
  height: 100%;
  box-shadow: inset 0 1px 0 0 var(--border-subtle);
  isolation: isolate;
}

.discovery-detail__stack {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.discovery-detail__inner {
  flex: 1;
  min-height: 0;
}

.discovery-detail__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.discovery-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  border-radius: var(--radius-md);
  background: var(--accent-subtle);
  border: 1px solid var(--accent-border);
  color: var(--accent-primary);
}

.discovery-badge--muted {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border-color: var(--border-subtle);
}

.discovery-detail__step {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.discovery-detail__question {
  margin: 0 0 var(--space-4);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--text-primary);
}

.discovery-detail__why {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.discovery-detail__nav {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-subtle);
  pointer-events: auto;
}

.discovery-nav-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: 0 var(--space-4);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast),
    box-shadow var(--transition-fast);
}

.discovery-nav-btn:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--accent-subtle);
}

.discovery-nav-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.discovery-nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.discovery-empty {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 900px) {
  .orbit-layout {
    grid-template-columns: 1fr;
  }

  .orbit-frame {
    max-width: 360px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-spin--slow,
  .orbit-spin--med,
  .orbit-spin--fast {
    animation: none;
  }

  .sun-core {
    animation: none;
  }
}
</style>
