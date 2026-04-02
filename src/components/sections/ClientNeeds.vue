<script setup lang="ts">
import { computed } from 'vue'
import type { ClientNeeds as ClientNeedsType } from '@/types/presales'

const props = defineProps<{
  needs: ClientNeedsType
}>()

const hasPrimary = computed(() => Boolean(props.needs.main_need?.trim()))
const hiddenCount = computed(() => props.needs.hidden_needs?.length ?? 0)
const hasSignals = computed(() => hiddenCount.value > 0)
</script>

<template>
  <div class="client-needs">
    <h3 class="sr-only">
      Client needs
    </h3>

    <div
      v-if="hasPrimary || hasSignals"
      class="cn-shell"
    >
      <div
        v-if="hasPrimary || hasSignals"
        class="cn-summary"
        role="status"
        aria-live="polite"
      >
        <template v-if="hasPrimary && hasSignals">
          Primary need + {{ hiddenCount }} underlying signal{{ hiddenCount === 1 ? '' : 's' }}
        </template>
        <template v-else-if="hasPrimary">
          Primary need
        </template>
        <template v-else>
          {{ hiddenCount }} underlying signal{{ hiddenCount === 1 ? '' : 's' }}
        </template>
      </div>

      <section
        v-if="hasPrimary"
        class="cn-primary"
        aria-labelledby="cn-primary-heading"
      >
        <div
          class="cn-primary__accent"
          aria-hidden="true"
        />
        <div class="cn-primary__body">
          <div class="cn-primary__head">
            <span
              id="cn-primary-heading"
              class="cn-eyebrow"
            >Primary need</span>
          </div>
          <p class="cn-primary__text">
            {{ needs.main_need }}
          </p>
        </div>
      </section>

      <section
        v-if="hasSignals"
        class="cn-signals"
        aria-labelledby="cn-signals-heading"
      >
        <div class="cn-signals__intro">
          <h4
            id="cn-signals-heading"
            class="cn-signals__title"
          >
            Underlying signals
          </h4>
          <span class="cn-signals__badge">{{ hiddenCount }}</span>
        </div>

        <ol class="cn-signals__list">
          <li
            v-for="(need, index) in needs.hidden_needs"
            :key="index"
            class="cn-signal"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div
              class="cn-signal__rail"
              aria-hidden="true"
            >
              <span class="cn-signal__node" />
            </div>
            <div class="cn-signal__card">
              <span class="cn-signal__idx">{{ String(index + 1).padStart(2, '0') }}</span>
              <p class="cn-signal__text">
                {{ need }}
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.client-needs {
  display: block;
}

.cn-shell {
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
  .cn-shell {
    padding: 24px;
  }
}

.cn-summary {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.cn-primary {
  display: flex;
  border-radius: 10px;
  border: 1px solid rgba(0, 230, 118, 0.14);
  background: rgba(8, 10, 9, 0.45);
  overflow: hidden;
  margin-bottom: 22px;
}

.cn-primary:last-child {
  margin-bottom: 0;
}

.cn-primary__accent {
  width: 4px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #00e676 0%, #00695c 100%);
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.25);
}

.cn-primary__body {
  flex: 1;
  min-width: 0;
  padding: 20px 22px 22px 20px;
}

.cn-primary__head {
  margin-bottom: 10px;
}

.cn-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: var(--font-mono);
  color: var(--accent-primary);
  opacity: 0.95;
}

.cn-primary__text {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  font-weight: 500;
  color: var(--text-primary);
}

.cn-signals__intro {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.cn-signals__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.cn-signals__badge {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid rgba(0, 230, 118, 0.22);
  color: var(--accent-primary);
}

.cn-signals__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.cn-signal {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 0 14px;
  align-items: stretch;
  opacity: 0;
  transform: translateY(8px);
  animation: cn-signal-in 0.45s ease forwards;
}

@media (prefers-reduced-motion: reduce) {
  .cn-signal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes cn-signal-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cn-signal__rail {
  position: relative;
  display: flex;
  justify-content: center;
  width: 20px;
}

.cn-signal__rail::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(
    180deg,
    rgba(0, 230, 118, 0.35) 0%,
    rgba(0, 230, 118, 0.08) 100%
  );
  border-radius: 1px;
}

.cn-signal:last-child .cn-signal__rail::before {
  bottom: 50%;
}

.cn-signal:first-child .cn-signal__rail::before {
  top: 50%;
}

.cn-signal:only-child .cn-signal__rail::before {
  display: none;
}

.cn-signal__node {
  position: relative;
  z-index: 1;
  align-self: center;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-base);
  border: 2px solid rgba(0, 230, 118, 0.65);
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.35);
}

.cn-signal__card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 16px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(8, 10, 9, 0.55);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.cn-signal:last-child .cn-signal__card {
  margin-bottom: 0;
}

.cn-signal__card:hover {
  border-color: rgba(0, 230, 118, 0.15);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}

.cn-signal__idx {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--accent-primary);
  opacity: 0.9;
  padding-top: 2px;
}

.cn-signal__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 500;
  color: var(--text-primary);
}

@media (min-width: 720px) {
  .cn-signals__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .cn-signal {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .cn-signal__rail {
    display: none;
  }

  .cn-signal__card {
    margin-bottom: 0;
    min-height: 100%;
  }
}
</style>
