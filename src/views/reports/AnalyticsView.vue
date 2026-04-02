<script setup lang="ts">
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard.vue'
</script>

<template>
  <div class="analytics-view">
    <AnalyticsDashboard hide-intro />
  </div>
</template>

<style scoped>
.analytics-view {
  position: relative;
  z-index: 1;
}
</style>
