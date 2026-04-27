<script setup lang="ts">
import CopyButton from '@/components/ui/CopyButton.vue'
import type { BriefingDocumentModel } from '@/utils/briefingPayload'
import { useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{
  /** Avoid naming `document` — shadows global */
  briefing: BriefingDocumentModel
  createdLabel: string
  plainText: string
}>()

const { y } = useWindowScroll()

const progress = computed(() => {
  if (typeof window === 'undefined') return 0
  const el = window.document.documentElement
  const scrollable = el.scrollHeight - el.clientHeight
  if (scrollable <= 0) return 100
  return Math.min(100, Math.max(0, (y.value / scrollable) * 100))
})

const showBackTop = computed(() => y.value > 360)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function sectionHeading(s: { heading?: string, title?: string }): string {
  const h = s.heading ?? s.title
  return typeof h === 'string' ? h : 'Section'
}

function sectionContent(s: { content?: string, body?: string }): string {
  const c = s.content ?? s.body
  return typeof c === 'string' ? c : ''
}

const toneLabel = computed(() => {
  const t = props.briefing.meta?.tone
  if (!t) return ''
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ')
})

</script>

<template>
  <div class="briefing-doc">
    <div
      class="briefing-doc__progress-track"
      aria-hidden="true"
    >
      <div
        class="briefing-doc__progress-fill"
        :style="{ transform: `scaleX(${progress / 100})` }"
      />
    </div>

    <header class="briefing-doc__topbar">
      <div class="briefing-doc__brand">
        <span class="briefing-doc__brand-mark" />
        <span class="briefing-doc__brand-text">PreSales AI</span>
      </div>
      <div class="briefing-doc__actions">
        <button
          type="button"
          class="briefing-doc__icon-btn"
          title="Back to top"
          aria-label="Back to top"
          :class="{ 'briefing-doc__icon-btn--visible': showBackTop }"
          @click="scrollToTop"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
        <CopyButton
          :text="plainText"
          variant="inline"
          label="Copy all"
          aria-label="Copy full briefing as plain text"
        />
      </div>
    </header>

    <div class="briefing-doc__layout">
      <aside
        v-if="briefing.sections.length > 1"
        class="briefing-doc__toc"
        aria-label="On this page"
      >
        <p class="briefing-doc__toc-title">
          On this page
        </p>
        <nav>
          <a
            v-if="briefing.intro"
            href="#briefing-intro"
            class="briefing-doc__toc-link"
          >Overview</a>
          <a
            v-for="(s, i) in briefing.sections"
            :key="i"
            :href="`#section-${i}`"
            class="briefing-doc__toc-link"
          >{{ sectionHeading(s) }}</a>
          <a
            v-if="briefing.closing"
            href="#briefing-closing"
            class="briefing-doc__toc-link"
          >Next steps</a>
        </nav>
      </aside>

      <div class="briefing-doc__main">
        <section class="briefing-doc__hero">
          <div class="briefing-doc__hero-glow" />
          <div class="briefing-doc__hero-inner">
            <p
              v-if="createdLabel"
              class="briefing-doc__eyebrow"
            >
              <time :datetime="createdLabel">{{ createdLabel }}</time>
              <span class="briefing-doc__eyebrow-dot">·</span>
              <span>Shared briefing</span>
            </p>
            <h1 class="briefing-doc__title">
              {{ briefing.title }}
            </h1>
            <div
              v-if="toneLabel"
              class="briefing-doc__chips"
            >
              <span class="briefing-doc__chip briefing-doc__chip--tone">
                <svg
                  class="briefing-doc__chip-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                {{ toneLabel }}
              </span>
            </div>
          </div>
        </section>

        <div
          v-if="briefing.intro"
          id="briefing-intro"
          class="briefing-doc__panel briefing-doc__panel--intro"
        >
          <div class="briefing-doc__panel-head">
            <span class="briefing-doc__panel-kicker">Opening</span>
          </div>
          <p class="briefing-doc__intro-text">
            {{ briefing.intro }}
          </p>
        </div>

        <div
          v-for="(s, i) in briefing.sections"
          :id="`section-${i}`"
          :key="i"
          class="briefing-doc__section"
          :style="{ '--stagger': `${Math.min(i, 8) * 45}ms` }"
        >
          <div class="briefing-doc__section-card">
            <div class="briefing-doc__section-rail">
              <span class="briefing-doc__section-index">{{ String(i + 1).padStart(2, '0') }}</span>
            </div>
            <div class="briefing-doc__section-body">
              <h2 class="briefing-doc__h2">
                {{ sectionHeading(s) }}
              </h2>
              <p class="briefing-doc__prose">
                {{ sectionContent(s) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="briefing.closing"
          id="briefing-closing"
          class="briefing-doc__panel briefing-doc__panel--closing"
        >
          <div class="briefing-doc__panel-head briefing-doc__panel-head--closing">
            <span class="briefing-doc__panel-kicker">Closing</span>
          </div>
          <p class="briefing-doc__closing-text">
            {{ briefing.closing }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.briefing-doc {
  --briefing-max: 42rem;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-base);
  color: var(--text-primary);
}

.briefing-doc__progress-track {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 50;
  background: rgba(0, 230, 118, 0.08);
  pointer-events: none;
}

.briefing-doc__progress-fill {
  height: 100%;
  width: 100%;
  transform-origin: left center;
  background: var(--gradient-brand);
  box-shadow: 0 0 16px rgba(0, 230, 118, 0.45);
  transition: transform 0.12s linear;
}

@media (prefers-reduced-motion: reduce) {
  .briefing-doc__progress-fill {
    transition: none;
  }
}

.briefing-doc__topbar {
  position: sticky;
  top: 3px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  padding-top: calc(var(--space-4) + 3px);
  background: linear-gradient(
    180deg,
    rgba(8, 11, 10, 0.94) 0%,
    rgba(8, 11, 10, 0.78) 70%,
    transparent 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.briefing-doc__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.briefing-doc__brand-mark {
  width: 8px;
  height: 28px;
  border-radius: 4px;
  background: var(--gradient-brand);
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.35);
}

.briefing-doc__brand-text {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.briefing-doc__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.briefing-doc__icon-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition:
    opacity var(--transition-base),
    transform var(--transition-base),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.briefing-doc__icon-btn--visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.briefing-doc__icon-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.briefing-doc__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6) calc(var(--space-16) + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 1100px) {
  .briefing-doc__layout {
    grid-template-columns: 200px minmax(0, var(--briefing-max));
    align-items: start;
    gap: var(--space-12);
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}

.briefing-doc__toc {
  position: sticky;
  top: 72px;
  padding-top: var(--space-2);
}

.briefing-doc__toc-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 var(--space-3);
}

.briefing-doc__toc nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.briefing-doc__toc-link {
  font-size: 13px;
  line-height: 1.35;
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-1) 0;
  border-left: 2px solid transparent;
  padding-left: var(--space-3);
  margin-left: -2px;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.briefing-doc__toc-link:hover {
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
}

@media (max-width: 1099px) {
  .briefing-doc__toc {
    display: none;
  }
}

.briefing-doc__main {
  min-width: 0;
}

.briefing-doc__hero {
  position: relative;
  margin-bottom: var(--space-10);
  padding: var(--space-8) 0 var(--space-4);
}

.briefing-doc__hero-glow {
  position: absolute;
  inset: -20% -10% auto;
  height: 280px;
  background: radial-gradient(
    ellipse 70% 60% at 50% 0%,
    rgba(0, 230, 118, 0.14) 0%,
    transparent 65%
  );
  pointer-events: none;
}

.briefing-doc__hero-inner {
  position: relative;
}

.briefing-doc__eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 var(--space-4);
}

.briefing-doc__eyebrow-dot {
  opacity: 0.5;
}

.briefing-doc__title {
  margin: 0;
  font-size: clamp(1.85rem, 4.5vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.12;
  color: var(--text-primary);
  max-width: 20ch;
}

.briefing-doc__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.briefing-doc__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.briefing-doc__chip--tone {
  border-color: rgba(0, 230, 118, 0.28);
  background: linear-gradient(
    135deg,
    rgba(0, 230, 118, 0.1) 0%,
    rgba(0, 137, 123, 0.06) 100%
  );
  color: var(--accent-primary);
}

.briefing-doc__chip-icon {
  width: 14px;
  height: 14px;
  opacity: 0.9;
}

.briefing-doc__panel {
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  border: 1px solid var(--border-subtle);
  background: linear-gradient(
    165deg,
    rgba(22, 29, 23, 0.95) 0%,
    rgba(15, 20, 16, 0.88) 100%
  );
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.05) inset,
    0 24px 48px rgba(0, 0, 0, 0.35);
}

.briefing-doc__panel--intro {
  border-color: rgba(0, 230, 118, 0.18);
  background: linear-gradient(
    155deg,
    rgba(0, 230, 118, 0.07) 0%,
    rgba(15, 20, 16, 0.92) 42%,
    rgba(15, 20, 16, 0.95) 100%
  );
}

.briefing-doc__panel--closing {
  border-color: rgba(0, 188, 212, 0.2);
  background: linear-gradient(
    155deg,
    rgba(0, 188, 212, 0.06) 0%,
    rgba(15, 20, 16, 0.95) 55%
  );
}

.briefing-doc__panel-head {
  margin-bottom: var(--space-4);
}

.briefing-doc__panel-head--closing {
  margin-bottom: var(--space-4);
}

.briefing-doc__panel-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.briefing-doc__intro-text,
.briefing-doc__closing-text {
  margin: 0;
  font-size: 17px;
  line-height: 1.75;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.briefing-doc__section {
  margin-bottom: var(--space-6);
  scroll-margin-top: 96px;
  animation: briefing-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: var(--stagger, 0ms);
}

@keyframes briefing-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .briefing-doc__section {
    animation: none;
    opacity: 1;
  }
}

.briefing-doc__section-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-5);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 230, 118, 0.12);
  background: var(--bg-surface);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.briefing-doc__section-card:hover {
  border-color: rgba(0, 230, 118, 0.22);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
}

.briefing-doc__section-rail {
  padding-top: 2px;
}

.briefing-doc__section-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: var(--accent-primary);
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid rgba(0, 230, 118, 0.22);
}

.briefing-doc__h2 {
  margin: 0 0 var(--space-4);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--text-primary);
}

.briefing-doc__prose {
  margin: 0;
  font-size: 16px;
  line-height: 1.72;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

@media print {
  .briefing-doc__progress-track,
  .briefing-doc__topbar,
  .briefing-doc__toc {
    display: none !important;
  }

  .briefing-doc__section-card {
    break-inside: avoid;
    box-shadow: none;
  }
}
</style>
