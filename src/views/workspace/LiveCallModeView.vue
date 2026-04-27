<script setup lang="ts">
import CopyButton from '@/components/ui/CopyButton.vue'
import { useLiveAssistStream } from '@/composables/useLiveAssist'
import { routeNames } from '@/router/route-names-registry'
import { formatApiError } from '@/utils/api-error'
import { onKeyStroke } from '@vueuse/core'
import { ref } from 'vue'

const jobPost = ref('')
const transcript = ref('')

const { streaming, streamedText, error, start, stop } = useLiveAssistStream()

async function runStream() {
  await start({
    transcript: transcript.value,
    job_post: jobPost.value.trim() || undefined,
  })
}

onKeyStroke('Enter', (e) => {
  if (!(e.metaKey || e.ctrlKey)) {
    return
  }
  e.preventDefault()
  if (!streaming.value && transcript.value.trim()) {
    void runStream()
  }
})
</script>

<template>
  <div class="live">
    <header class="live__bar">
      <RouterLink
        :to="{ name: routeNames.dealWorkspace }"
        class="live__back"
      >
        ← Deal workspace
      </RouterLink>
      <span class="live__badge">Live assist</span>
      <button
        v-if="streaming"
        type="button"
        class="live__stop"
        @click="stop"
      >
        Stop
      </button>
    </header>

    <div class="live__body">
      <label class="live__field live__field--compact">
        <span class="live__label">Job post (optional)</span>
        <textarea
          v-model="jobPost"
          class="live__area live__area--sm"
          rows="2"
          placeholder="Anchor the model on the posting…"
        />
      </label>

      <label class="live__field">
        <span class="live__label">Transcript <span class="live__hint">⌘↵ run stream</span></span>
        <textarea
          v-model="transcript"
          class="live__area"
          rows="14"
          placeholder="Paste conversation as it happens. Streaming opens on the right."
          autofocus
        />
      </label>

      <div class="live__actions">
        <button
          type="button"
          class="live__btn live__btn--primary"
          :disabled="streaming || !transcript.trim()"
          @click="runStream"
        >
          {{ streaming ? 'Streaming…' : 'Stream assist' }}
        </button>
      </div>

      <p
        v-if="error"
        class="live__err"
      >
        {{ formatApiError(error) }}
      </p>
    </div>

    <aside
      class="live__aside"
      aria-label="Streaming output"
    >
      <div class="live__aside-head">
        <h2 class="live__aside-title">
          Suggestions
        </h2>
        <CopyButton
          v-if="streamedText"
          :text="streamedText"
          variant="inline"
          label="Copy"
          aria-label="Copy streamed text"
        />
      </div>
      <div class="live__stream">
        {{ streamedText || '—' }}
      </div>
    </aside>
  </div>
</template>

<style scoped>
.live {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 400px);
  grid-template-rows: auto 1fr;
  min-height: calc(100vh - 2rem);
  gap: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .live {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
}

.live__bar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.live__back {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
}

.live__back:hover {
  color: var(--accent-primary);
}

.live__badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 230, 118, 0.3);
  color: var(--accent-primary);
}

.live__stop {
  margin-left: auto;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 120, 120, 0.4);
  background: rgba(40, 12, 14, 0.6);
  color: rgba(255, 200, 200, 0.95);
  font-weight: 600;
  cursor: pointer;
}

.live__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.live__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.live__field--compact {
  opacity: 0.9;
}

.live__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}

.live__hint {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}

.live__area {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.2);
  background: rgba(5, 8, 7, 0.92);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.45;
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
}

.live__area--sm {
  min-height: 56px;
  font-size: 13px;
}

.live__actions {
  display: flex;
  gap: var(--space-2);
}

.live__btn {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 230, 118, 0.25);
  background: rgba(12, 16, 14, 0.95);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
}

.live__btn--primary {
  background: rgba(0, 230, 118, 0.14);
  border-color: rgba(0, 230, 118, 0.4);
  color: var(--accent-primary);
}

.live__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.live__err {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 170, 170, 0.95);
}

.live__aside {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 230, 118, 0.14);
  background: rgba(6, 9, 8, 0.75);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.live__aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.live__aside-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.live__stream {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
  max-height: calc(100vh - 200px);
}
</style>
