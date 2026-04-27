<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    label?: string
    /** Shorter label for icon-only */
    ariaLabel?: string
    variant?: 'icon' | 'inline'
  }>(),
  { label: 'Copy', ariaLabel: 'Copy to clipboard', variant: 'icon' },
)

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(copied, (v) => {
  if (v) {
    ElMessage.success({ message: 'Copied', duration: 1600 })
  }
})

async function copy() {
  if (!props.text) return
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    ElMessage.error('Could not copy')
  }
}
</script>

<template>
  <button
    type="button"
    class="copy-btn"
    :class="{ 'copy-btn--inline': variant === 'inline', 'copy-btn--done': copied }"
    :aria-label="ariaLabel"
    @click="copy"
  >
    <svg
      v-if="!copied"
      class="copy-btn__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
    <svg
      v-else
      class="copy-btn__icon copy-btn__icon--check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
    <span
      v-if="variant === 'inline'"
      class="copy-btn__text"
    >{{ copied ? 'Copied' : label }}</span>
  </button>
</template>

<style scoped>
.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
  flex-shrink: 0;
}

.copy-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: var(--accent-subtle);
}

.copy-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.copy-btn--inline {
  width: auto;
  min-height: 32px;
  padding: 0 var(--space-3);
}

.copy-btn__text {
  font-size: 12px;
  font-weight: 600;
}

.copy-btn__icon {
  width: 16px;
  height: 16px;
}

.copy-btn--done {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

@media (prefers-reduced-motion: reduce) {
  .copy-btn {
    transition: none;
  }
}
</style>
