<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  loading: boolean
  error: string | null
  /** Raw API envelope — shape varies by backend */
  payload: unknown
}>()

const emit = defineEmits<{
  proceed: []
  cancel: []
  retry: []
  /** Skip pre-check and run full analysis immediately */
  skip: []
}>()

function unwrapData(): Record<string, unknown> | null {
  const p = props.payload
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>
  const inner = o.data
  if (inner && typeof inner === 'object') {
    return inner as Record<string, unknown>
  }
  return o
}

const riskLevel = computed(() => {
  const d = unwrapData()
  const raw = d?.risk_level ?? d?.riskLevel
  return typeof raw === 'string' ? raw.toUpperCase() : ''
})

const headline = computed(() => {
  const d = unwrapData()
  const h = d?.headline
  return typeof h === 'string' ? h : ''
})

const signals = computed((): string[] => {
  const d = unwrapData()
  const s = d?.signals
  if (!Array.isArray(s)) return []
  return s.filter((x): x is string => typeof x === 'string')
})

const recommendation = computed(() => {
  const d = unwrapData()
  const r = d?.recommendation
  return typeof r === 'string' ? r : ''
})

const rationale = computed(() => {
  const d = unwrapData()
  const r = d?.rationale
  return typeof r === 'string' ? r : ''
})

const trafficClass = computed(() => {
  if (riskLevel.value.includes('HIGH')) return 'prescreen-traffic--high'
  if (riskLevel.value.includes('MEDIUM')) return 'prescreen-traffic--medium'
  if (riskLevel.value.includes('LOW')) return 'prescreen-traffic--low'
  return 'prescreen-traffic--neutral'
})

const riskBadgeLabel = computed(() => {
  const r = riskLevel.value
  if (!r) return ''
  if (r.includes('HIGH')) return 'High risk'
  if (r.includes('MEDIUM')) return 'Elevated'
  if (r.includes('LOW')) return 'Lower risk'
  return r.replace(/_/g, ' ').trim()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="prescreen-fade">
      <div
        v-if="open"
        class="prescreen-root"
        role="presentation"
      >
        <div
          class="prescreen-backdrop"
          aria-hidden="true"
          @click="emit('cancel')"
        />
        <div
          class="prescreen-dialog"
          :class="trafficClass"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prescreen-title"
          aria-describedby="prescreen-desc"
          @click.stop
        >
          <div class="prescreen-chrome">
            <div class="prescreen-title-row">
              <div
                class="prescreen-traffic"
                :class="trafficClass"
                aria-hidden="true"
              >
                <span class="prescreen-traffic__dot" />
                <span class="prescreen-traffic__dot" />
                <span class="prescreen-traffic__dot" />
              </div>
              <span
                v-if="riskBadgeLabel && !loading && !error"
                class="prescreen-risk-pill"
              >{{ riskBadgeLabel }}</span>
            </div>

            <h2
              id="prescreen-title"
              class="prescreen-title"
            >
              Pre-flight risk scan
            </h2>
            <p
              id="prescreen-desc"
              class="prescreen-lede"
            >
              Decide whether to run the full pipeline now — or adjust the brief first.
            </p>

            <div
              v-if="loading"
              class="prescreen-loading"
              aria-live="polite"
              aria-busy="true"
            >
              <BrandLoader size="lg" />
              <span>Scanning your brief…</span>
              <button
                type="button"
                class="prescreen-btn prescreen-btn--ghost"
                @click="emit('skip')"
              >
                Skip pre-check
              </button>
            </div>

            <div
              v-else-if="error"
              class="prescreen-error"
              role="alert"
            >
              <p>{{ error }}</p>
              <div class="prescreen-actions">
                <button
                  type="button"
                  class="prescreen-btn prescreen-btn--ghost"
                  @click="emit('retry')"
                >
                  Retry pre-check
                </button>
                <button
                  type="button"
                  class="prescreen-btn prescreen-btn--ghost"
                  @click="emit('skip')"
                >
                  Skip
                </button>
                <button
                  type="button"
                  class="prescreen-btn prescreen-btn--primary"
                  @click="emit('proceed')"
                >
                  Continue anyway
                </button>
              </div>
            </div>

            <template v-else>
              <p
                v-if="headline"
                class="prescreen-headline"
              >
                {{ headline }}
              </p>

              <div
                v-if="signals.length"
                class="prescreen-signals"
                role="list"
              >
                <span
                  v-for="(s, i) in signals"
                  :key="i"
                  class="prescreen-chip"
                  role="listitem"
                >{{ s }}</span>
              </div>

              <div
                v-if="recommendation"
                class="prescreen-callout"
              >
                <span class="prescreen-callout__label">Recommended action</span>
                <p class="prescreen-callout__body">
                  {{ recommendation }}
                </p>
              </div>
              <p
                v-if="rationale"
                class="prescreen-block prescreen-block--muted"
              >
                {{ rationale }}
              </p>

              <div class="prescreen-actions">
                <button
                  type="button"
                  class="prescreen-btn prescreen-btn--ghost"
                  @click="emit('cancel')"
                >
                  Back to edit
                </button>
                <button
                  type="button"
                  class="prescreen-btn prescreen-btn--ghost"
                  @click="emit('skip')"
                >
                  Skip
                </button>
                <button
                  type="button"
                  class="prescreen-btn prescreen-btn--primary"
                  @click="emit('proceed')"
                >
                  Proceed
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.prescreen-root {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.prescreen-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
}

.prescreen-dialog {
  position: relative;
  width: min(480px, 100%);
  max-height: min(90vh, 720px);
  overflow-y: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  border-left-width: 4px;
  background: linear-gradient(
    165deg,
    rgba(22, 29, 23, 0.98) 0%,
    rgba(12, 16, 14, 0.99) 100%
  );
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.04) inset,
    0 24px 80px rgba(0, 0, 0, 0.5);
}

.prescreen-dialog.prescreen-traffic--high {
  border-left-color: #f87171;
}

.prescreen-dialog.prescreen-traffic--medium {
  border-left-color: #fbbf24;
}

.prescreen-dialog.prescreen-traffic--low {
  border-left-color: var(--accent-primary);
}

.prescreen-dialog.prescreen-traffic--neutral {
  border-left-color: #64748b;
}

.prescreen-chrome {
  padding: var(--space-6);
}

.prescreen-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.prescreen-risk-pill {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: rgba(0, 0, 0, 0.25);
}

.prescreen-traffic {
  display: flex;
  gap: var(--space-2);
  margin-bottom: 0;
}

.prescreen-traffic__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--border-default);
}

.prescreen-traffic--high .prescreen-traffic__dot {
  background: #f87171;
}

.prescreen-traffic--medium .prescreen-traffic__dot {
  background: #fbbf24;
}

.prescreen-traffic--low .prescreen-traffic__dot {
  background: var(--accent-primary);
}

.prescreen-traffic--neutral .prescreen-traffic__dot {
  background: var(--text-muted);
}

.prescreen-title {
  margin: 0 0 var(--space-2);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.prescreen-lede {
  margin: 0 0 var(--space-5);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
}

.prescreen-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6) 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.prescreen-loading .prescreen-btn {
  margin-top: var(--space-2);
}

.prescreen-error {
  color: #fecaca;
  font-size: 14px;
  line-height: 1.5;
}

.prescreen-headline {
  margin: 0 0 var(--space-3);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.45;
}

.prescreen-signals {
  margin: 0 0 var(--space-4);
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.prescreen-chip {
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-subtle);
}

.prescreen-callout {
  margin: 0 0 var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.22);
  background: rgba(0, 230, 118, 0.06);
}

.prescreen-callout__label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-primary);
  margin-bottom: var(--space-2);
}

.prescreen-callout__body {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-primary);
}

.prescreen-block {
  margin: 0 0 var(--space-3);
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-primary);
}

.prescreen-block--muted {
  color: var(--text-muted);
  font-size: 13px;
}

.prescreen-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.prescreen-btn {
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  padding: var(--space-3) var(--space-5);
  border: 1px solid transparent;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.prescreen-btn--ghost {
  background: transparent;
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.prescreen-btn--ghost:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.prescreen-btn--primary {
  background: var(--gradient-brand);
  color: var(--text-inverse);
  border: none;
  box-shadow: 0 2px 12px rgba(0, 230, 118, 0.25);
}

.prescreen-btn--primary:hover {
  filter: brightness(1.05);
}

.prescreen-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.prescreen-fade-enter-active,
.prescreen-fade-leave-active {
  transition: opacity 0.2s ease;
}

.prescreen-fade-enter-from,
.prescreen-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .prescreen-fade-enter-active,
  .prescreen-fade-leave-active {
    transition: none;
  }
}
</style>
