<script setup lang="ts">
import SplashScreen from '@/components/SplashScreen.vue'
import { routeNames } from '@/router/route-names-registry'
import { useRouter } from 'vue-router'

const router = useRouter()

function onStart() {
  void router.push({ name: routeNames.analyze })
}
</script>

<template>
  <div class="home-view-root">
    <SplashScreen @start="onStart" />
  </div>
</template>

<style scoped>
.home-view-root {
  min-height: 100%;
  min-height: min(100vh, 100dvh);
  background: var(--bg-base);
}
</style>
