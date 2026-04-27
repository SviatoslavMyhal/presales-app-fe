<script setup lang="ts">
defineProps<{
  navItems: readonly { id: string, label: string, icon: string }[]
  activeSection: string
}>()

const emit = defineEmits<{
  scroll: [id: string]
}>()
</script>

<template>
  <aside class="report-sidebar">
    <nav
      class="report-nav"
      aria-label="Sections"
    >
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ active: activeSection === item.id }"
        @click="emit('scroll', item.id)"
      >
        <svg
          class="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path
            :d="item.icon"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.report-sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  /* Align with fixed report header — inherited from `.report-page` on live & saved */
  top: calc(var(--report-header-gap, 72px) + var(--space-2));
  align-self: flex-start;
  max-height: calc(100vh - var(--report-header-gap, 72px) - var(--space-6));
  overflow-y: auto;
  overscroll-behavior: contain;
}

.report-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-left: 2px solid transparent;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  border-top: none;
  border-right: none;
  border-bottom: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.nav-item.active {
  color: var(--accent-primary);
  background: var(--accent-subtle);
  border-left-color: var(--accent-primary);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@media (max-width: 1023px) {
  .report-sidebar {
    display: none;
  }
}
</style>
