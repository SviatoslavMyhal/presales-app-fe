<script setup lang="ts">
import { routeNames } from '@/router/route-names-registry'

import ReportsTabIcon from './ReportsTabIcon.vue'

const tabs = [
  {
    routeName: routeNames.reports,
    label: 'Saved reports',
    variant: 'saved' as const,
  },
  {
    routeName: routeNames.reportsAnalytics,
    label: 'Analytics',
    variant: 'analytics' as const,
  },
]
</script>

<template>
  <nav
    class="reports-tabs"
    aria-label="Reports navigation"
  >
    <RouterLink
      v-for="tab in tabs"
      :key="tab.routeName"
      :to="{ name: tab.routeName }"
      class="reports-tabs__link"
      active-class=""
      exact-active-class="is-active"
    >
      <ReportsTabIcon :variant="tab.variant" />
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.reports-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-1);
  border-radius: var(--radius-lg);
  background: rgba(12, 16, 14, 0.75);
  border: 1px solid rgba(0, 230, 118, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
}

.reports-tabs__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-secondary);
  text-decoration: none;
  border: 1px solid transparent;
  transition:
    color var(--transition-fast),
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.reports-tabs__link:hover {
  color: var(--text-primary);
  background: rgba(0, 230, 118, 0.06);
}

.reports-tabs__link.is-active {
  color: var(--accent-primary);
  background: rgba(0, 230, 118, 0.12);
  border-color: rgba(0, 230, 118, 0.35);
  box-shadow: 0 0 24px rgba(0, 230, 118, 0.12);
}

@media (max-width: 480px) {
  .reports-tabs {
    width: 100%;
    flex-direction: column;
  }

  .reports-tabs__link {
    width: 100%;
    justify-content: center;
  }
}
</style>
