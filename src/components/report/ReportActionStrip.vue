<script setup lang="ts">
import type { ReportKitTabId } from '@/types/report-kit'

const emit = defineEmits<{
  open: [tab: ReportKitTabId]
}>()

const items: { id: ReportKitTabId, label: string, hint: string }[] = [
  { id: 'call', label: 'Script', hint: 'Call flow' },
  { id: 'objections', label: 'Objections', hint: 'Comebacks' },
  { id: 'competitors', label: 'Alternatives', hint: 'Other options' },
  { id: 'followup', label: 'Email', hint: 'Follow-up' },
  { id: 'briefing', label: 'Share', hint: 'Client page' },
]
</script>

<template>
  <nav
    class="action-strip"
    aria-label="Open call kit sections"
  >
    <p class="action-strip__kicker">
      Call kit
    </p>
    <div class="action-strip__chips">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="action-strip__chip"
        @click="emit('open', item.id)"
      >
        <span class="action-strip__chip-label">{{ item.label }}</span>
        <span class="action-strip__chip-hint">{{ item.hint }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.action-strip {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-4);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgba(0, 230, 118, 0.08);
}

.action-strip__kicker {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(0, 230, 118, 0.75);
}

.action-strip__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.action-strip__chip {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: var(--space-2) var(--space-3);
  border-radius: 10px;
  border: 1px solid rgba(0, 230, 118, 0.14);
  background: linear-gradient(
    165deg,
    rgba(18, 24, 20, 0.65) 0%,
    rgba(10, 14, 12, 0.85) 100%
  );
  color: var(--text-primary);
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.action-strip__chip:hover {
  border-color: rgba(0, 230, 118, 0.35);
  box-shadow: 0 0 24px rgba(0, 230, 118, 0.08);
  transform: translateY(-1px);
}

.action-strip__chip:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.action-strip__chip-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.action-strip__chip-hint {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

@media (max-width: 1023px) {
  .action-strip {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .action-strip__chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: var(--space-1);
    scrollbar-width: thin;
  }
}
</style>
