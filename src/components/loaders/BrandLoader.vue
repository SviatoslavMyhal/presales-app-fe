<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 16px — buttons; 32px — inline; 64px — hero / page masks */
    size?: 'xs' | 'sm' | 'lg'
  }>(),
  { size: 'lg' }
)

const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '_')
const gradId = computed(() => `brand-loader-grad-${uid}`)

const px = computed(() => {
  switch (props.size) {
    case 'xs':
      return 16
    case 'sm':
      return 32
    case 'lg':
    default:
      return 64
  }
})
</script>

<template>
  <div
    class="brand-loader"
    :class="`brand-loader--${size}`"
    role="status"
    aria-live="polite"
    aria-label="Loading"
  >
    <svg
      class="brand-loader__svg"
      :width="px"
      :height="px"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          :id="gradId"
          x1="8"
          y1="12"
          x2="56"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00e676" />
          <stop
            offset="0.52"
            stop-color="#00897b"
          />
          <stop
            offset="1"
            stop-color="#00bcd4"
          />
        </linearGradient>
      </defs>

      <!-- Soft glow layer (no blur filter — GPU-friendly) -->
      <g
        class="brand-loader__glow"
        opacity="0.22"
      >
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          :stroke="`url(#${gradId})`"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="38 114"
          transform="rotate(-90 32 32)"
        />
      </g>

      <!-- Three staggered arcs — multi-agent / synthesis orbit -->
      <g class="brand-loader__orbit brand-loader__orbit--a">
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          :stroke="`url(#${gradId})`"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-dasharray="42 108"
          transform="rotate(-90 32 32)"
        />
      </g>
      <g class="brand-loader__orbit brand-loader__orbit--b">
        <circle
          cx="32"
          cy="32"
          r="17"
          fill="none"
          :stroke="`url(#${gradId})`"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-dasharray="30 77"
          transform="rotate(42 32 32)"
        />
      </g>
      <g class="brand-loader__orbit brand-loader__orbit--c">
        <circle
          cx="32"
          cy="32"
          r="10"
          fill="none"
          :stroke="`url(#${gradId})`"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-dasharray="18 45"
          transform="rotate(198 32 32)"
        />
      </g>

      <!-- Core pulse -->
      <circle
        class="brand-loader__core"
        cx="32"
        cy="32"
        r="3"
        fill="#00e676"
      />
    </svg>
  </div>
</template>

<style scoped>
.brand-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
}

.brand-loader__svg {
  display: block;
  overflow: visible;
}

.brand-loader__orbit--a {
  transform-origin: 32px 32px;
  animation: brand-orbit-cw 2.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

.brand-loader__orbit--b {
  transform-origin: 32px 32px;
  animation: brand-orbit-ccw 3.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  opacity: 0.92;
}

.brand-loader__orbit--c {
  transform-origin: 32px 32px;
  animation: brand-orbit-cw 2.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  opacity: 0.88;
}

.brand-loader__glow {
  transform-origin: 32px 32px;
  animation: brand-orbit-cw 4.2s linear infinite;
}

.brand-loader__core {
  transform-origin: 32px 32px;
  animation: brand-core-pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(0, 230, 118, 0.45));
}

@keyframes brand-orbit-cw {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes brand-orbit-ccw {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

@keyframes brand-core-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(0.88);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-loader__orbit--a,
  .brand-loader__orbit--b,
  .brand-loader__orbit--c,
  .brand-loader__glow {
    animation: none;
  }

  .brand-loader__orbit--b {
    transform: rotate(120deg);
  }

  .brand-loader__orbit--c {
    transform: rotate(240deg);
  }

  .brand-loader__core {
    animation: none;
    opacity: 0.9;
  }
}
</style>
