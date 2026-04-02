<script setup lang="ts">
import ReportsWorkspaceTabs from '@/components/reports/ReportsWorkspaceTabs.vue'
import { useReportsWorkspaceLede } from '@/composables/useReportsWorkspaceLede'

const { lede } = useReportsWorkspaceLede()
</script>

<template>
  <div class="reports-shell">
    <div
      class="reports-bg"
      aria-hidden="true"
    />

    <header class="reports-hero">
      <p class="reports-kicker">
        Workspace
      </p>
      <h1 class="reports-title">
        Reports
      </h1>
      <p class="reports-lede">
        {{ lede }}
      </p>

      <ReportsWorkspaceTabs />
    </header>

    <router-view />
  </div>
</template>

<style scoped>
.reports-shell {
  position: relative;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding:
    calc(var(--space-12) + var(--space-4))
    clamp(1.25rem, 4vw, 2.5rem)
    clamp(3rem, 8vh, 5rem);
  box-sizing: border-box;
}

.reports-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0, 230, 118, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 100% 60%, rgba(0, 137, 123, 0.06) 0%, transparent 45%);
}

.reports-hero {
  position: relative;
  z-index: 1;
  margin-bottom: clamp(1.75rem, 4vw, 2.5rem);
  padding: 0 clamp(0.25rem, 2vw, 1rem);
  text-align: center;
}

.reports-kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-primary);
  opacity: 0.9;
}

.reports-title {
  margin: 0 0 var(--space-3);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.reports-lede {
  margin: 0 auto var(--space-6);
  max-width: 40rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
