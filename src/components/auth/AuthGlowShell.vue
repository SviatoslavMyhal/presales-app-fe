<script setup lang="ts">
import { onMounted, ref } from 'vue'

const entered = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    entered.value = true
  })
})

const particles = [
  { left: '8%', top: '12%', delay: '0s', duration: '14s' },
  { left: '18%', top: '78%', delay: '1.2s', duration: '18s' },
  { left: '88%', top: '22%', delay: '0.4s', duration: '16s' },
  { left: '72%', top: '65%', delay: '2.1s', duration: '12s' },
  { left: '42%', top: '8%', delay: '0.8s', duration: '20s' },
  { left: '55%', top: '88%', delay: '1.5s', duration: '15s' },
  { left: '92%', top: '48%', delay: '0.2s', duration: '17s' },
  { left: '28%', top: '38%', delay: '2.4s', duration: '19s' },
]
</script>

<template>
  <div class="auth-glow">
    <div
      class="auth-glow__bg"
      aria-hidden="true"
    />
    <span
      v-for="(p, i) in particles"
      :key="i"
      class="auth-glow__particle"
      :style="{
        left: p.left,
        top: p.top,
        animationDelay: p.delay,
        animationDuration: p.duration
      }"
    />
    <div
      class="auth-glow__inner"
      :class="{ 'is-in': entered }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-glow {
  position: relative;
  min-height: 100%;
  min-height: min(100vh, 100dvh);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-5);
  background: var(--bg-base);
  overflow: hidden;
}

.auth-glow__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 55% 45% at 50% 35%, rgba(0, 230, 118, 0.09) 0%, transparent 55%),
    radial-gradient(ellipse 40% 30% at 80% 70%, rgba(0, 137, 123, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.auth-glow__particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--accent-primary);
  opacity: 0.2;
  animation-name: auth-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  pointer-events: none;
}

.auth-glow__inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity var(--transition-slow),
    transform var(--transition-slow);
}

.auth-glow__inner.is-in {
  opacity: 1;
  transform: translateY(0);
}

@keyframes auth-float {
  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.15;
  }
  50% {
    transform: translate(6px, -10px);
    opacity: 0.35;
  }
}
</style>
