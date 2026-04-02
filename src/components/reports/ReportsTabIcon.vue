<script setup lang="ts">
defineProps<{
  variant: 'saved' | 'analytics'
}>()
</script>

<template>
  <span
    class="reports-tabs__icon"
    aria-hidden="true"
  >
    <svg
      v-if="variant === 'saved'"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  </span>
</template>

<style scoped>
.reports-tabs__icon {
  display: flex;
  flex-shrink: 0;
}

.reports-tabs__icon svg {
  width: 18px;
  height: 18px;
  opacity: 0.85;
}
</style>
