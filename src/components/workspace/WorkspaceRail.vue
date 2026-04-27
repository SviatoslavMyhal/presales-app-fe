<script setup lang="ts">
import { routeNames } from '@/router/route-names-registry'
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { name: routeNames.today, label: 'Today', to: { name: routeNames.today }, icon: 'today' as const },
  { name: routeNames.pipeline, label: 'Pipeline', to: { name: routeNames.pipeline }, icon: 'pipeline' as const },
  { name: routeNames.dealWorkspace, label: 'Deal', to: { name: routeNames.dealWorkspace }, icon: 'deal' as const },
  { name: routeNames.reportsAnalytics, label: 'Insights', to: { name: routeNames.reportsAnalytics }, icon: 'insights' as const },
  { name: routeNames.analyze, label: 'Capture', to: { name: routeNames.analyze }, icon: 'capture' as const },
]

function isActive(name: string) {
  return route.name === name
}
</script>

<template>
  <nav
    class="rail"
    aria-label="Workspace"
  >
    <RouterLink
      :to="{ name: routeNames.today }"
      class="rail__brand"
      aria-label="PreSales AI — Today"
    >
      <span class="rail__mark">PS</span>
    </RouterLink>

    <ul class="rail__list">
      <li
        v-for="item in items"
        :key="item.name"
      >
        <RouterLink
          :to="item.to"
          class="rail__link"
          :class="{ 'is-active': isActive(item.name) }"
          :aria-current="isActive(item.name) ? 'page' : undefined"
        >
          <span
            class="rail__glyph"
            aria-hidden="true"
          >
            <template v-if="item.icon === 'today'">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </template>
            <template v-else-if="item.icon === 'pipeline'">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 12h10M4 18h16"
                />
              </svg>
            </template>
            <template v-else-if="item.icon === 'insights'">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 8v8m-4-5v5m-4-2v2M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </template>
            <template v-else-if="item.icon === 'deal'">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </template>
            <template v-else>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </template>
          </span>
          <span class="rail__label">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.rail {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-4) var(--space-2);
  box-sizing: border-box;
  background: rgba(10, 14, 12, 0.92);
  border-right: 1px solid rgba(0, 230, 118, 0.12);
  backdrop-filter: blur(14px);
}

.rail__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(0, 230, 118, 0.18), rgba(0, 137, 123, 0.12));
  border: 1px solid rgba(0, 230, 118, 0.28);
  text-decoration: none;
  color: var(--accent-primary);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.rail__mark {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rail__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.rail__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-2) var(--space-1);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.rail__link:hover {
  color: var(--text-primary);
  background: rgba(0, 230, 118, 0.06);
}

.rail__link.is-active {
  color: var(--accent-primary);
  background: rgba(0, 230, 118, 0.1);
  border-color: rgba(0, 230, 118, 0.25);
}

.rail__glyph svg {
  width: 22px;
  height: 22px;
  display: block;
}

.rail__label {
  text-align: center;
  line-height: 1.15;
  max-width: 64px;
}

@media (max-width: 640px) {
  .rail {
    width: 100%;
    height: auto;
    bottom: auto;
    flex-direction: row;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    border-right: none;
    border-bottom: 1px solid rgba(0, 230, 118, 0.12);
  }

  .rail__list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-1);
  }

  .rail__link {
    flex-direction: row;
    gap: var(--space-2);
    font-size: 12px;
  }

  .rail__label {
    max-width: none;
  }
}
</style>
