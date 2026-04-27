<script setup lang="ts">
import { routeNames } from '@/router/route-names-registry'
import { onKeyStroke } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const open = ref(false)
const q = ref('')
const router = useRouter()

const actions = computed(() => {
  const items = [
    { label: 'Go to Today', name: routeNames.today, keywords: 'home dashboard' },
    { label: 'Open Pipeline', name: routeNames.pipeline, keywords: 'deals opportunities' },
    { label: 'Deal engine', name: routeNames.dealWorkspace, keywords: 'presales ai workspace' },
    { label: 'Live assist', name: routeNames.liveAssist, keywords: 'call stream sse' },
    { label: 'Insights', name: routeNames.reportsAnalytics, keywords: 'analytics' },
    { label: 'New capture', name: routeNames.analyze, keywords: 'analyze job post' },
  ] as const
  const needle = q.value.trim().toLowerCase()
  if (!needle) {
    return [...items]
  }
  return items.filter(
    i =>
      i.label.toLowerCase().includes(needle)
      || i.keywords.includes(needle),
  )
})

function close() {
  open.value = false
  q.value = ''
}

function run(name: string) {
  void router.push({ name })
  close()
}

onKeyStroke('k', (e) => {
  if (!(e.metaKey || e.ctrlKey)) {
    return
  }
  e.preventDefault()
  open.value = !open.value
})

watch(open, (v) => {
  if (v) {
    q.value = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="palette-backdrop"
      role="presentation"
      @click.self="close"
    >
      <div
        class="palette"
        role="dialog"
        aria-label="Command palette"
        @keydown.escape.prevent="close"
      >
        <input
          v-model="q"
          type="search"
          class="palette__input"
          placeholder="Jump to…"
          autofocus
          autocomplete="off"
          @keydown.enter.prevent="actions[0] && run(actions[0].name)"
        >
        <ul class="palette__list">
          <li
            v-for="a in actions"
            :key="a.name"
          >
            <button
              type="button"
              class="palette__item"
              @click="run(a.name)"
            >
              {{ a.label }}
            </button>
          </li>
          <li
            v-if="!actions.length"
            class="palette__empty"
          >
            No matches
          </li>
        </ul>
        <p class="palette__hint">
          <kbd>Esc</kbd> close · <kbd>⌘</kbd><kbd>K</kbd> toggle
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh var(--space-4) var(--space-4);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

.palette {
  width: min(420px, 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 230, 118, 0.2);
  background: rgba(12, 16, 14, 0.96);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
}

.palette__input {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-4);
  border: none;
  border-bottom: 1px solid rgba(0, 230, 118, 0.12);
  background: transparent;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
  outline: none;
}

.palette__list {
  list-style: none;
  margin: 0;
  padding: var(--space-2);
  max-height: 280px;
  overflow: auto;
}

.palette__item {
  width: 100%;
  text-align: left;
  padding: var(--space-3) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}

.palette__item:hover {
  background: rgba(0, 230, 118, 0.1);
}

.palette__empty {
  padding: var(--space-4);
  color: var(--text-secondary);
  font-size: 13px;
}

.palette__hint {
  margin: 0;
  padding: var(--space-2) var(--space-4) var(--space-3);
  font-size: 11px;
  color: var(--text-secondary);
}

.palette__hint kbd {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 10px;
  margin: 0 2px;
}
</style>
