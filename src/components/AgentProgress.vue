<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import type { PresalesRequest, PresalesResponse, SynthesisReport } from '@/types/presales'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  result?: PresalesResponse | null
  error?: string | null
  initialPayload?: PresalesRequest | null
  report?: SynthesisReport
}>()

type AgentStatus = 'idle' | 'active' | 'complete'

const agents = [
  {
    name: 'Analyst',
    desc: 'Validates inputs and extracts structured signals.'
  },
  {
    name: 'Risk & Discovery',
    desc: 'Surfaces risks and discovery angles.'
  },
  {
    name: 'Strategy',
    desc: 'Shapes positioning and solution framing.'
  },
  {
    name: 'Synthesis',
    desc: 'Assembles the final presales report.'
  }
]

const statuses = ref<AgentStatus[]>(['idle', 'idle', 'idle', 'idle'])

let timers: ReturnType<typeof setTimeout>[] = []

function clearTimers () {
  for (const t of timers) {
    clearTimeout(t)
  }
  timers = []
}

function setAll (s: AgentStatus[]) {
  statuses.value = [...s]
}

/** Progress bar width tracks pipeline; last segment stays short until the API returns. */
const progressWidth = computed(() => {
  const s = statuses.value
  if (s.every(x => x === 'complete')) {
    return 100
  }
  let done = 0
  while (done < 4 && s[done] === 'complete') {
    done++
  }
  const base = done * 25
  if (done < 4 && s[done] === 'active') {
    return Math.min(92, base + 20)
  }
  return base
})

function finishPipeline () {
  clearTimers()
  setAll(['complete', 'complete', 'complete', 'complete'])
}

watch(
  () => props.result,
  (r) => {
    if (r) {
      finishPipeline()
    }
  }
)

onMounted(() => {
  if (props.result) {
    finishPipeline()
    return
  }
  const seq: [number, AgentStatus[]][] = [
    [0, ['active', 'idle', 'idle', 'idle']],
    [2500, ['complete', 'active', 'idle', 'idle']],
    [5000, ['complete', 'complete', 'active', 'idle']],
    [7500, ['complete', 'complete', 'complete', 'active']]
  ]
  for (const [delay, next] of seq) {
    timers.push(
      setTimeout(() => {
        if (props.result) {
          return
        }
        setAll(next)
      }, delay)
    )
  }
})

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <div class="agent-progress">
    <div
      class="rings"
      aria-hidden="true"
    >
      <BrandLoader
        class="rings-loader"
        size="lg"
      />
    </div>

    <div class="agent-inner">
      <h1 class="agent-title">
        Analyzing your opportunity
      </h1>
      <p class="agent-sub">
        4 agents are working in sequence
      </p>

      <ul
        class="pipeline"
        role="list"
      >
        <li
          v-for="(agent, index) in agents"
          :key="agent.name"
          class="pipeline-card"
        >
          <div class="pipeline-head">
            <span class="pipeline-badge">{{ index + 1 }}</span>
            <div class="pipeline-text">
              <p class="pipeline-name">
                {{ agent.name }}
              </p>
              <p class="pipeline-desc">
                {{ agent.desc }}
              </p>
            </div>
            <span
              class="status-dot"
              :class="`status-dot--${statuses[index]}`"
              aria-hidden="true"
            >
              <svg
                v-if="statuses[index] === 'complete'"
                class="status-check"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </span>
          </div>
        </li>
      </ul>

      <div
        class="progress-track"
        aria-hidden="true"
      >
        <div
          class="progress-fill"
          :style="{ width: `${progressWidth}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-progress {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--bg-base);
  overflow: hidden;
}

.rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.rings-loader {
  opacity: 0.45;
  transform: scale(2.25);
}

.agent-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.agent-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 var(--space-3);
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.agent-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-8);
}

.pipeline {
  list-style: none;
  margin: 0 0 var(--space-8);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (min-width: 1024px) {
  .pipeline {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-4);
  }

  .pipeline-card {
    flex: 1 1 calc(50% - var(--space-2));
    min-width: 200px;
    max-width: 240px;
  }
}

.pipeline-card {
  text-align: left;
  padding: var(--space-4) var(--space-6);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.pipeline-head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.pipeline-badge {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-inverse);
  background: var(--gradient-brand);
}

.pipeline-text {
  flex: 1;
  min-width: 0;
}

.pipeline-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.pipeline-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.status-dot {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
}

.status-dot--idle {
  background: var(--bg-elevated);
}

.status-dot--active {
  background: var(--accent-subtle);
  border-color: var(--accent-primary);
  animation: pulse-dot 1.2s ease-in-out infinite;
}

.status-dot--complete {
  background: var(--accent-subtle);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.status-check {
  width: 14px;
  height: 14px;
}

.progress-track {
  height: 4px;
  border-radius: 2px;
  background: var(--bg-elevated);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 0;
  background: var(--gradient-brand);
  transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
