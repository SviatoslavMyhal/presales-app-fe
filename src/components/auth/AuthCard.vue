<script setup lang="ts">
import AuthGlowShell from '@/components/auth/AuthGlowShell.vue'
</script>

<template>
  <AuthGlowShell>
    <div class="auth-card">
      <slot name="header" />
      <slot />
    </div>
  </AuthGlowShell>
</template>

<style src="./auth-card.css"></style>
