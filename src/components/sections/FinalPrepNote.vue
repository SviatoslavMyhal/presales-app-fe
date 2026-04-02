<script setup lang="ts">
defineProps<{
  note: string
}>()
</script>

<template>
  <div class="prep-note">
    <h3 class="sr-only">
      Final prep note
    </h3>
    <div
      class="prep-note__shine"
      aria-hidden="true"
    />
    <div
      class="prep-note__mark"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        class="prep-note__svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          stroke-width="1"
          stroke-opacity="0.35"
        />
        <path
          d="M32 12v20l12 8"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-opacity="0.9"
        />
      </svg>
    </div>
    <p
      v-if="note"
      class="prep-note__text"
    >
      {{ note }}
    </p>
  </div>
</template>

<style scoped>
.prep-note {
  position: relative;
  padding: var(--space-2) 0 var(--space-2) var(--space-6);
  border-left: 3px solid var(--accent-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.prep-note__shine {
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-md);
  background: radial-gradient(
    120% 80% at 0% 0%,
    var(--accent-subtle) 0%,
    transparent 55%
  );
  opacity: 0.65;
  pointer-events: none;
}

.prep-note__mark {
  position: relative;
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-5);
  color: var(--accent-primary);
  filter: drop-shadow(0 0 12px var(--accent-border));
}

.prep-note__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.prep-note__text {
  position: relative;
  margin: 0;
  font-size: 16px;
  line-height: 1.85;
  letter-spacing: 0.01em;
  color: var(--text-primary);
}

.prep-note__text::before {
  content: '"';
  position: absolute;
  left: -0.15em;
  top: -0.2em;
  font-size: 3.5rem;
  line-height: 1;
  font-family: Georgia, 'Times New Roman', serif;
  color: var(--accent-primary);
  opacity: 0.2;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .prep-note__mark {
    filter: none;
  }
}
</style>
