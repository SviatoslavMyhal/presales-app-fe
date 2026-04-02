<script setup lang="ts">
import type { ClientTypeData } from '@/types/presales'
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    data: ClientTypeData
    section?: 'full' | 'profile' | 'signals'
  }>(),
  { section: 'full' },
)

const showProfile = () =>
  props.section === 'full' || props.section === 'profile'
const showSignals = () =>
  props.section === 'full' || props.section === 'signals'

const barWidth = ref('0%')

onMounted(() => {
  setTimeout(() => {
    barWidth.value = `${props.data.confidence_pct}%`
  }, 100)
})
</script>

<template>
  <div
    class="client-type-widget widget-card"
    :class="{
      'client-type-widget--profile-only': section === 'profile',
      'client-type-widget--signals-only': section === 'signals',
    }"
  >
    <template v-if="showProfile()">
      <span class="widget-kicker">Client Type</span>
      <div
        class="type-badge"
        :class="{ 'type-badge--warn': data.warning }"
      >
        <span
          v-if="data.warning"
          class="warn-icon"
          aria-hidden="true"
        >⚠</span>
        {{ data.type }}
      </div>
      <p
        v-if="data.warning"
        class="type-warning-sub"
      >
        Proceed with extra caution on this call
      </p>
      <div class="conf-bar-block">
        <div class="conf-bar-head">
          <span class="conf-bar-label">Confidence</span>
          <span class="conf-bar-val">{{ data.confidence_pct }}%</span>
        </div>
        <div class="conf-bar-track">
          <div
            class="confidence-fill"
            :style="{
              width: barWidth,
              transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            }"
          />
        </div>
      </div>
    </template>
    <template v-if="showSignals()">
      <p
        v-if="section === 'signals'"
        class="split-kicker"
      >
        Detected signals
      </p>
      <div
        v-if="data.signals.length"
        class="signals"
        :class="{ 'signals--alone': section === 'signals' }"
      >
        <span
          v-for="(s, i) in data.signals"
          :key="i"
          class="signal-pill"
        >{{ s }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.client-type-widget {
  padding: var(--space-6);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 1px 0 0 var(--border-subtle);
}

.widget-kicker {
  display: block;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: var(--space-5);
}

.type-badge {
  display: block;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-md);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: var(--space-3);
  text-align: center;
  background: var(--accent-subtle);
  border: 1px solid var(--accent-border);
  color: var(--accent-primary);
}

.type-badge--warn {
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  color: var(--severity-high);
}

.warn-icon {
  margin-right: var(--space-1);
}

.type-warning-sub {
  margin: 0 0 var(--space-4);
  font-size: 11px;
  line-height: 1.45;
  color: var(--severity-high);
  text-align: center;
}

.conf-bar-block {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
}

.conf-bar-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.conf-bar-label {
  font-size: 12px;
  color: var(--text-muted);
}

.conf-bar-val {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.conf-bar-track {
  height: 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-base);
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  width: 0;
  border-radius: var(--radius-sm);
  background: var(--gradient-brand);
}

.signals {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-subtle);
}

.signal-pill {
  display: block;
  padding: var(--space-2) var(--space-3);
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  line-height: 1.5;
}

.split-kicker {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  margin: 0 0 var(--space-4);
}

.signals--alone {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
  gap: var(--space-3);
}

.client-type-widget--profile-only .conf-bar-block {
  margin-bottom: 0;
}

.client-type-widget--signals-only {
  justify-content: flex-start;
}
</style>
