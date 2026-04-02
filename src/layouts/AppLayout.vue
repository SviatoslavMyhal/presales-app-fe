<script setup lang="ts">
import { useAppFloatingHome } from '@/composables/useAppFloatingHome'

const { showFloatingHome, goHome } = useAppFloatingHome()
</script>

<template>
  <div class="app-shell">
    <button
      v-if="showFloatingHome"
      type="button"
      class="floating-home"
      aria-label="Back to home"
      @click="goHome"
    >
      <span class="floating-home__arrow" aria-hidden="true">←</span>
      <span class="floating-home__brand">PreSales AI</span>
    </button>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  position: relative;
}

.floating-home {
  position: fixed;
  top: var(--space-5);
  left: var(--space-5);
  z-index: 200;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid rgba(0, 230, 118, 0.22);
  border-radius: 999px;
  background: rgba(15, 20, 16, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.floating-home:hover {
  border-color: rgba(0, 230, 118, 0.45);
  color: var(--accent-primary);
  box-shadow: 0 0 24px rgba(0, 230, 118, 0.12);
}

.floating-home:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.floating-home__arrow {
  opacity: 0.85;
}

.floating-home__brand {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  min-height: 0;
}
</style>
