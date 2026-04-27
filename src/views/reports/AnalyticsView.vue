<script setup lang="ts">
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard.vue'
</script>

<template>
  <div class="analytics-view">
    <header class="analytics-view__hero">
      <p class="analytics-view__kicker">
        Workspace
      </p>
      <h1 class="analytics-view__title">
        Insights
      </h1>
      <p class="analytics-view__lede">
        Aggregated presales intelligence from saved opportunities — trends, mix, and risk signals.
      </p>
    </header>
    <AnalyticsDashboard hide-intro />
  </div>
</template>

<style scoped>
.analytics-view {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.analytics-view__hero {
  margin-bottom: clamp(1.5rem, 4vw, 2.25rem);
  text-align: center;
}

.analytics-view__kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.analytics-view__title {
  margin: 0 0 var(--space-3);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.analytics-view__lede {
  margin: 0 auto;
  max-width: 40rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
