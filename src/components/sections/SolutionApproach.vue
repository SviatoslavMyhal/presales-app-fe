<script setup lang="ts">
import type { SolutionPoint } from '@/types/presales'
import { formatLabel } from '@/utils/formatLabel'

defineProps<{
  approach: SolutionPoint[]
}>()
</script>

<template>
  <div class="approach">
    <h3 class="sr-only">
      Solution approach
    </h3>
    <ol
      v-if="approach.length"
      class="approach-list"
    >
      <li
        v-for="(step, index) in approach"
        :key="index"
        class="approach-step"
        :style="{ '--step-i': index }"
      >
        <div class="approach-rail">
          <span class="approach-node">
            <span
              class="approach-node__glow"
              aria-hidden="true"
            />
            <span
              class="approach-node__ring"
              aria-hidden="true"
            />
            <span class="approach-node__index">{{ String(index + 1).padStart(2, '0') }}</span>
          </span>
          <span
            v-if="index < approach.length - 1"
            class="approach-connector"
            aria-hidden="true"
          />
        </div>
        <div class="approach-card">
          <p class="approach-card__type">
            {{ formatLabel(step.type) }}
          </p>
          <p
            v-if="step.point"
            class="approach-card__point"
          >
            {{ step.point }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.approach {
  min-width: 0;
}

.approach-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.approach-step {
  display: flex;
  gap: var(--space-5);
  align-items: stretch;
  opacity: 0;
  transform: translateX(-8px);
  animation: approach-in 0.55s ease forwards;
  animation-delay: calc(var(--step-i, 0) * 0.07s);
}

@keyframes approach-in {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.approach-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 52px;
  flex-shrink: 0;
  padding-top: 2px;
}

.approach-node {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.approach-node__glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    var(--accent-border) 0%,
    transparent 70%
  );
  opacity: 0.55;
  transform: scale(1.15);
}

.approach-node__ring {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  border: 2px solid transparent;
  background:
    linear-gradient(var(--bg-base), var(--bg-base)) padding-box,
    var(--gradient-brand) border-box;
}

.approach-node__index {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--accent-primary);
}

.approach-connector {
  flex: 1;
  min-height: var(--space-6);
  width: 3px;
  margin-top: var(--space-2);
  margin-bottom: var(--space-1);
  border-radius: 3px;
  background: linear-gradient(
    180deg,
    var(--accent-primary) 0%,
    var(--accent-muted) 55%,
    transparent 100%
  );
  opacity: 0.55;
  position: relative;
}

.approach-card {
  flex: 1;
  min-width: 0;
  padding: var(--space-5) var(--space-6);
  margin-bottom: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: linear-gradient(
    145deg,
    var(--bg-elevated) 0%,
    var(--bg-surface) 100%
  );
  box-shadow:
    0 0 0 1px var(--border-subtle),
    inset 0 1px 0 0 var(--border-subtle);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.approach-step:last-child .approach-card {
  margin-bottom: 0;
}

.approach-card:hover {
  border-color: var(--border-default);
  box-shadow:
    0 0 0 1px var(--accent-border),
    0 8px 32px var(--accent-subtle);
  transform: translateY(-1px);
}

.approach-card__type {
  margin: 0 0 var(--space-3);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .approach-card__type {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.approach-card__point {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .approach-step {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .approach-card:hover {
    transform: none;
  }
}

@media (max-width: 520px) {
  .approach-card {
    padding: var(--space-4) var(--space-5);
  }

  .approach-rail {
    width: 44px;
  }

  .approach-node {
    width: 40px;
    height: 40px;
  }
}
</style>
