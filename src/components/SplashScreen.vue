<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'
import type { PresalesRequest, PresalesResponse, SynthesisReport } from '@/types/presales'

defineProps<{
  result?: PresalesResponse | null
  error?: string | null
  initialPayload?: PresalesRequest | null
  report?: SynthesisReport
}>()

const emit = defineEmits<{
  start: []
}>()

const router = useRouter()
const auth = useAuthStore()
const { isAuthenticated } = storeToRefs(auth)

function goAuth () {
  router.push({ name: routeNames.login })
}

function goReports () {
  router.push({ name: routeNames.reports })
}

function signOut () {
  auth.logout()
}

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
  { left: '65%', top: '18%', delay: '1s', duration: '13s' },
  { left: '12%', top: '55%', delay: '1.8s', duration: '21s' },
  { left: '48%', top: '72%', delay: '0.6s', duration: '14s' },
  { left: '78%', top: '92%', delay: '2.2s', duration: '16s' }
]
</script>

<template>
  <div class="splash">
    <div
      class="splash-ambient"
      aria-hidden="true"
    >
      <div class="splash-ambient__blob splash-ambient__blob--a" />
      <div class="splash-ambient__blob splash-ambient__blob--b" />
      <div class="splash-ambient__mesh" />
    </div>
    <div
      class="splash-glow"
      aria-hidden="true"
    />
    <span
      v-for="(p, i) in particles"
      :key="i"
      class="particle"
      :style="{
        left: p.left,
        top: p.top,
        animationDelay: p.delay,
        animationDuration: p.duration
      }"
    />
    <div class="splash-inner">
      <div
        class="logo-wrap"
        :class="{ 'is-in': entered }"
      >
        <svg
          class="orbit-ring"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="splash-orbit-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stop-color="#00e676"
                stop-opacity="0.5"
              />
              <stop
                offset="50%"
                stop-color="#00897b"
                stop-opacity="0.25"
              />
              <stop
                offset="100%"
                stop-color="#00bcd4"
                stop-opacity="0.35"
              />
            </linearGradient>
          </defs>
          <circle
            class="orbit-ring__track"
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#splash-orbit-grad)"
            stroke-width="0.75"
            stroke-linecap="round"
            stroke-dasharray="72 216"
          />
        </svg>
        <svg
          class="hex hex--outer"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <polygon
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
        <svg
          class="hex hex--inner"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <polygon
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
      </div>
      <h1
        class="product-title"
        :class="{ 'is-in': entered }"
      >
        <span class="product-title__text">PreSales AI</span>
      </h1>
      <p
        class="tagline"
        :class="{ 'is-in': entered }"
      >
        Prepare smarter. Close faster.
      </p>
      <div
        class="cta-stack"
        :class="{ 'is-in': entered }"
      >
        <button
          type="button"
          class="cta"
          @click="emit('start')"
        >
          <span class="cta__label">Start Analysis</span>
        </button>
        <button
          v-if="!isAuthenticated"
          type="button"
          class="cta-auth"
          @click="goAuth"
        >
          <span class="cta-auth__label">Sign in</span>
        </button>
        <button
          v-else
          type="button"
          class="cta-auth"
          @click="goReports"
        >
          <span class="cta-auth__label">My reports</span>
        </button>
      </div>
      <p
        class="powered"
        :class="{ 'is-in': entered }"
      >
        <span
          class="pulse-dot"
          aria-hidden="true"
        />
        Powered by 4 AI agents
      </p>
      <button
        v-if="isAuthenticated"
        type="button"
        class="sign-out"
        :class="{ 'is-in': entered }"
        @click="signOut"
      >
        Sign out
      </button>
    </div>
  </div>
</template>

<style scoped>
.splash {
  position: relative;
  min-height: 100vh;
  min-height: min(100vh, 100dvh);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--bg-base);
  overflow: hidden;
}

/* Slow-drifting light pools — no blur filters, GPU-friendly transforms */
.splash-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.splash-ambient__blob {
  position: absolute;
  border-radius: 50%;
  will-change: transform, opacity;
}

.splash-ambient__blob--a {
  width: min(85vw, 520px);
  height: min(85vw, 520px);
  top: -18%;
  left: -22%;
  background: radial-gradient(
    circle at 40% 40%,
    rgba(0, 230, 118, 0.11) 0%,
    rgba(0, 137, 123, 0.04) 45%,
    transparent 68%
  );
  animation: splash-aurora-a 22s ease-in-out infinite alternate;
}

.splash-ambient__blob--b {
  width: min(75vw, 480px);
  height: min(75vw, 480px);
  bottom: -25%;
  right: -18%;
  background: radial-gradient(
    circle at 60% 55%,
    rgba(0, 188, 212, 0.08) 0%,
    rgba(0, 230, 118, 0.05) 42%,
    transparent 65%
  );
  animation: splash-aurora-b 26s ease-in-out infinite alternate;
}

.splash-ambient__mesh {
  position: absolute;
  inset: 0;
  opacity: 0.65;
  background-image:
    linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 45%, black 0%, transparent 75%);
  animation: splash-mesh-drift 48s linear infinite;
}

.splash-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 60% 40% at 50% 60%,
    rgba(0, 230, 118, 0.07) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--accent-primary);
  opacity: 0.22;
  animation-name: float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  pointer-events: none;
  z-index: 0;
}

.splash-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 560px;
  text-align: center;
}

.logo-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto var(--space-8);
  opacity: 0;
  transform: translateY(var(--space-2)) scale(0.96);
  transition:
    opacity var(--transition-slow),
    transform var(--transition-slow);
}

.logo-wrap.is-in {
  opacity: 1;
  transform: translateY(0) scale(1);
  animation: splash-logo-breathe 5s ease-in-out infinite;
}

.orbit-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 0;
  width: 112px;
  height: 112px;
  margin-left: -56px;
  margin-top: -56px;
  color: transparent;
  animation: splash-orbit-spin 28s linear infinite;
}

.orbit-ring__track {
  transform-origin: 50% 50%;
}

.hex {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  width: 88px;
  height: 88px;
  margin-left: -44px;
  margin-top: -44px;
  color: var(--accent-primary);
}

.hex--inner {
  color: var(--accent-muted);
  animation: splash-inner-hex 32s linear infinite;
}

.hex--outer {
  animation: spin-slow 20s linear infinite;
}

.product-title {
  font-size: clamp(2.25rem, 8vw, 3.25rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.08;
  margin: 0 0 var(--space-4);
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity var(--transition-slow) 150ms,
    transform var(--transition-slow) 150ms;
}

.product-title__text {
  display: inline-block;
  background: var(--gradient-text);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-rendering: optimizeLegibility;
}

.product-title.is-in {
  opacity: 1;
  transform: translateY(0);
}

.product-title.is-in .product-title__text {
  animation: splash-title-gradient 8s ease-in-out infinite;
}

.tagline {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 var(--space-8);
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity var(--transition-slow) 300ms,
    transform var(--transition-slow) 300ms;
}

.tagline.is-in {
  opacity: 1;
  transform: translateY(0);
}

.cta-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity var(--transition-slow) 450ms,
    transform var(--transition-slow) 450ms;
}

.cta-stack.is-in {
  opacity: 1;
  transform: translateY(0);
}

.cta {
  position: relative;
  cursor: pointer;
  width: 100%;
  height: 52px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--gradient-brand);
  background-size: 200% 100%;
  color: var(--text-inverse);
  font-weight: 600;
  font-size: 16px;
  font-family: inherit;
  overflow: hidden;
  isolation: isolate;
  transition:
    transform var(--transition-base),
    filter var(--transition-fast),
    box-shadow var(--transition-base);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.28),
    0 12px 40px rgba(0, 230, 118, 0.18),
    0 0 60px rgba(0, 230, 118, 0.08);
}

.cta__label {
  position: relative;
  z-index: 1;
}

.cta::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    105deg,
    transparent 0%,
    transparent 40%,
    rgba(255, 255, 255, 0.22) 50%,
    transparent 60%,
    transparent 100%
  );
  transform: translateX(-120%);
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.cta:hover::after {
  transform: translateX(120%);
}

.cta-auth {
  position: relative;
  cursor: pointer;
  width: 100%;
  height: 48px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.45);
  background: rgba(0, 230, 118, 0.06);
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 15px;
  font-family: inherit;
  overflow: hidden;
  isolation: isolate;
  transition:
    transform var(--transition-base),
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-base);
  box-shadow: 0 0 24px rgba(0, 230, 118, 0.08);
}

.cta-auth__label {
  position: relative;
  z-index: 1;
}

.cta-auth:hover {
  background: rgba(0, 230, 118, 0.12);
  border-color: var(--accent-primary);
  box-shadow:
    0 0 36px rgba(0, 230, 118, 0.2),
    0 0 0 1px rgba(0, 230, 118, 0.15) inset;
  transform: translateY(-1px);
}

.cta-auth:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
}

.cta:hover {
  transform: translateY(-2px) scale(1.01);
  filter: brightness(1.06);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.35),
    0 16px 48px rgba(0, 230, 118, 0.22),
    0 0 80px rgba(0, 230, 118, 0.12);
}

.cta:active {
  transform: translateY(0) scale(0.99);
}

.cta:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
}

.sign-out {
  display: block;
  margin: var(--space-3) auto 0;
  padding: 0;
  border: none;
  background: none;
  font-size: 12px;
  font-family: inherit;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  opacity: 0;
  transition:
    opacity var(--transition-slow) 620ms,
    color var(--transition-fast);
}

.sign-out.is-in {
  opacity: 1;
}

.sign-out:hover {
  color: var(--text-secondary);
}

.powered {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-8);
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity var(--transition-slow) 600ms,
    transform var(--transition-slow) 600ms;
}

.powered.is-in {
  opacity: 1;
  transform: translateY(0);
}

.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-primary);
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.45);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes splash-aurora-a {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.88;
  }
  100% {
    transform: translate(8%, 6%) scale(1.08);
    opacity: 0.62;
  }
}

@keyframes splash-aurora-b {
  0% {
    transform: translate(0, 0) scale(1.05);
    opacity: 0.78;
  }
  100% {
    transform: translate(-7%, -5%) scale(1);
    opacity: 0.52;
  }
}

@keyframes splash-mesh-drift {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-48px, -48px);
  }
}

@keyframes splash-orbit-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes splash-inner-hex {
  from {
    transform: translate(5px, 5px) rotate(0deg);
  }
  to {
    transform: translate(5px, 5px) rotate(-360deg);
  }
}

@keyframes splash-title-gradient {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes splash-logo-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0 18px rgba(0, 230, 118, 0.22));
  }
  50% {
    filter: drop-shadow(0 0 34px rgba(0, 230, 118, 0.42));
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash-ambient__blob--a,
  .splash-ambient__blob--b,
  .splash-ambient__mesh,
  .orbit-ring,
  .hex--outer,
  .hex--inner,
  .product-title.is-in .product-title__text,
  .logo-wrap.is-in {
    animation: none !important;
  }

  .logo-wrap.is-in {
    filter: drop-shadow(0 0 20px rgba(0, 230, 118, 0.28));
  }

  .cta::after {
    display: none;
  }
}
</style>
