<script setup lang="ts">
import PublicBriefingDocument from '@/components/briefing/PublicBriefingDocument.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { fetchPublicBriefing } from '@/api/public-briefing'
import { formatApiError } from '@/utils/api-error'
import {
  briefingDocumentToPlainText,
  parseBriefingDocument,
} from '@/utils/briefingPayload'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const code = ref<string | null>(null)
const data = ref<unknown>(null)

const record = computed(() =>
  data.value && typeof data.value === 'object' ? (data.value as Record<string, unknown>) : null,
)

const createdLabel = computed(() => {
  const raw = record.value?.created_at
  if (typeof raw !== 'string') return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
})

const briefingModel = computed(() => parseBriefingDocument(data.value))

const plainText = computed(() => {
  const doc = briefingModel.value
  if (doc) {
    return briefingDocumentToPlainText(doc, createdLabel.value || undefined)
  }
  if (data.value) {
    return JSON.stringify(data.value, null, 2)
  }
  return ''
})

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) {
    error.value = 'Invalid link'
    loading.value = false
    return
  }
  try {
    data.value = await fetchPublicBriefing(slug)
  }
  catch (e: unknown) {
    error.value = formatApiError(e)
    code.value = (e as Error & { code?: string })?.code ?? null
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="briefing-page">
    <div
      class="briefing-page__mesh"
      aria-hidden="true"
    />

    <div
      v-if="loading"
      class="briefing-page__skeleton"
      aria-busy="true"
      aria-label="Loading briefing"
    >
      <div class="briefing-page__skeleton-bar briefing-page__skeleton-bar--long" />
      <div class="briefing-page__skeleton-bar briefing-page__skeleton-bar--short" />
      <div class="briefing-page__skeleton-card">
        <div class="briefing-page__skeleton-bar briefing-page__skeleton-bar--med" />
        <div class="briefing-page__skeleton-bar" />
        <div class="briefing-page__skeleton-bar" />
        <div class="briefing-page__skeleton-bar briefing-page__skeleton-bar--med" />
      </div>
      <BrandLoader
        class="briefing-page__loader"
        size="lg"
      />
    </div>

    <div
      v-else-if="error"
      class="briefing-page__error"
      role="alert"
    >
      <div class="briefing-page__error-card">
        <h1 class="briefing-page__error-title">
          {{ code === 'SERVICE_UNAVAILABLE' ? 'Briefing unavailable' : 'Could not load briefing' }}
        </h1>
        <p class="briefing-page__error-text">
          {{ error }}
        </p>
      </div>
    </div>

    <PublicBriefingDocument
      v-else-if="briefingModel"
      :briefing="briefingModel"
      :created-label="createdLabel"
      :plain-text="plainText"
    />

    <div
      v-else
      class="briefing-page__fallback"
    >
      <div class="briefing-page__fallback-card">
        <h1 class="briefing-page__fallback-title">
          Briefing format not recognized
        </h1>
        <p class="briefing-page__fallback-lede">
          We couldn’t map this response to a readable briefing. You can still copy the raw payload below.
        </p>
        <details class="briefing-page__raw">
          <summary>Technical details</summary>
          <pre class="briefing-page__pre">{{ JSON.stringify(data, null, 2) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
.briefing-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-base);
  position: relative;
}

.briefing-page__mesh {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;
  background-image:
    linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 75% 60% at 50% 20%, black 0%, transparent 75%);
}

.briefing-page__skeleton {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6);
}

.briefing-page__skeleton-bar {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 0%,
    rgba(0, 230, 118, 0.08) 50%,
    var(--bg-elevated) 100%
  );
  background-size: 200% 100%;
  animation: briefing-shimmer 1.2s ease-in-out infinite;
  margin-bottom: var(--space-3);
}

.briefing-page__skeleton-bar--long {
  width: 72%;
}

.briefing-page__skeleton-bar--short {
  width: 40%;
}

.briefing-page__skeleton-bar--med {
  width: 55%;
}

.briefing-page__skeleton-card {
  margin-top: var(--space-8);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.briefing-page__loader {
  display: flex;
  justify-content: center;
  margin-top: var(--space-8);
}

@keyframes briefing-shimmer {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .briefing-page__skeleton-bar {
    animation: none;
  }
}

.briefing-page__error {
  position: relative;
  z-index: 1;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.briefing-page__error-card {
  max-width: 420px;
  text-align: center;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(248, 113, 113, 0.25);
  background: rgba(248, 113, 113, 0.06);
}

.briefing-page__error-title {
  margin: 0 0 var(--space-3);
  font-size: 1.125rem;
  font-weight: 700;
  color: #fecaca;
}

.briefing-page__error-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.briefing-page__fallback {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6);
}

.briefing-page__fallback-card {
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.briefing-page__fallback-title {
  margin: 0 0 var(--space-3);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.briefing-page__fallback-lede {
  margin: 0 0 var(--space-6);
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.briefing-page__raw summary {
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: var(--space-3);
}

.briefing-page__pre {
  margin: 0;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  font-size: 12px;
  line-height: 1.45;
  overflow: auto;
  max-height: min(50vh, 420px);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
