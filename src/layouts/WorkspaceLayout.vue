<script setup lang="ts">
import WorkspaceCommandPalette from '@/components/workspace/WorkspaceCommandPalette.vue'
import WorkspaceRail from '@/components/workspace/WorkspaceRail.vue'
</script>

<template>
  <div class="workspace-shell">
    <WorkspaceRail />
    <div class="workspace-main">
      <RouterView />
    </div>
    <WorkspaceCommandPalette />
  </div>
</template>

<style scoped>
.workspace-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  background: var(--bg-base);
}

.workspace-main {
  flex: 1;
  min-width: 0;
  margin-left: 72px;
  padding:
    calc(var(--space-8) + env(safe-area-inset-top, 0px))
    clamp(1rem, 3vw, 2rem)
    calc(var(--space-12) + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .workspace-main {
    margin-left: 0;
    margin-top: 56px;
    padding-top: var(--space-4);
  }
}
</style>
