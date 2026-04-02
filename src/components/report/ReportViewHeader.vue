<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { routeNames } from '@/router/route-names-registry'
import type { PresalesRequest } from '@/types/presales'
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

const saveTitle = defineModel<string>('saveTitle', { default: '' })
const exportMenuOpen = defineModel<boolean>('exportMenuOpen', { default: false })

const exportRootRef = ref<HTMLElement | null>(null)

onClickOutside(exportRootRef, () => {
  exportMenuOpen.value = false
})

defineProps<{
  projectTitle: string
  variant: 'live' | 'saved'
  analyzePayload?: PresalesRequest | null
  canSave: boolean
  saving: boolean
  canShowProposalCta: boolean
  savedReportId?: string | null
  deleteInProgress?: boolean
}>()

const emit = defineEmits<{
  save: []
  exportMarkdown: []
  exportJson: []
  printReport: []
  openProposal: []
  leave: []
  reset: []
  requestDelete: []
}>()
</script>

<template>
  <header class="report-top">
    <RouterLink
      :to="{ name: routeNames.home }"
      class="wordmark"
      aria-label="PreSales AI — home"
    >
      PreSales AI
    </RouterLink>
    <p class="project-title">
      {{ projectTitle }}
    </p>
    <div class="report-header-actions report-header-actions--desktop">
      <div
        v-if="canSave"
        class="save-wrap"
      >
        <input
          v-model="saveTitle"
          type="text"
          class="save-input"
          placeholder="Title (optional)"
          aria-label="Report title"
        >
        <button
          type="button"
          class="btn-save"
          :disabled="saving"
          @click="emit('save')"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
      <RouterLink
        v-else-if="variant === 'live' && analyzePayload"
        :to="{ name: routeNames.login, query: { redirect: '/' } }"
        class="save-hint-link"
      >
        Log in to save
      </RouterLink>
      <div
        ref="exportRootRef"
        class="export-wrap"
      >
        <button
          type="button"
          class="btn-export"
          aria-haspopup="menu"
          :aria-expanded="exportMenuOpen"
          aria-controls="report-export-menu"
          @click="exportMenuOpen = !exportMenuOpen"
        >
          <svg
            class="btn-export__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span class="btn-export__label">Export</span>
        </button>
        <ul
          v-show="exportMenuOpen"
          id="report-export-menu"
          class="export-menu"
          role="menu"
          aria-label="Export report"
        >
          <li role="none">
            <button
              type="button"
              class="export-menu__item"
              role="menuitem"
              @click="emit('exportMarkdown')"
            >
              <span class="export-menu__title">Markdown</span>
              <span class="export-menu__hint">.md — best for notes &amp; docs</span>
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              class="export-menu__item"
              role="menuitem"
              @click="emit('exportJson')"
            >
              <span class="export-menu__title">JSON</span>
              <span class="export-menu__hint">Structured data</span>
            </button>
          </li>
          <li
            class="export-menu__sep"
            role="separator"
          />
          <li role="none">
            <button
              type="button"
              class="export-menu__item"
              role="menuitem"
              @click="emit('printReport')"
            >
              <span class="export-menu__title">Print / Save as PDF</span>
              <span class="export-menu__hint">Uses your browser print dialog</span>
            </button>
          </li>
        </ul>
      </div>
      <button
        v-if="canShowProposalCta"
        type="button"
        class="btn-proposal-cta"
        @click="emit('openProposal')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        Generate Proposal Draft
      </button>
      <button
        v-if="variant === 'saved'"
        type="button"
        class="btn-new btn-new--back"
        @click="emit('leave')"
      >
        <svg
          class="btn-new__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 18l-6-6 6-6"
          />
        </svg>
        <span class="btn-new__label">Back to reports</span>
      </button>
      <button
        v-if="variant === 'saved' && savedReportId"
        type="button"
        class="btn-delete-saved"
        :disabled="deleteInProgress"
        aria-label="Delete this report"
        @click="emit('requestDelete')"
      >
        <BrandLoader
          v-if="deleteInProgress"
          size="xs"
        />
        <svg
          v-else
          class="btn-delete-saved__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span class="btn-delete-saved__label">{{ deleteInProgress ? 'Deleting…' : 'Delete' }}</span>
      </button>
      <button
        v-else-if="variant !== 'saved'"
        type="button"
        class="btn-new"
        @click="emit('reset')"
      >
        <svg
          class="btn-new__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span class="btn-new__label">New Analysis</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.report-top {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 var(--space-6);
  background: var(--bg-base);
  border-bottom: 1px solid var(--border-subtle);
}

.wordmark {
  font-size: 16px;
  font-weight: 600;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  flex-shrink: 0;
  text-decoration: none;
  cursor: pointer;
}

.wordmark:hover {
  opacity: 0.92;
}

.wordmark:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
  border-radius: 4px;
}

.project-title {
  margin: 0;
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.3;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .report-header-actions--desktop {
    display: none !important;
  }
}

.save-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.save-input {
  width: min(160px, 28vw);
  height: 32px;
  padding: 0 var(--space-3);
  font-size: 12px;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.save-input::placeholder {
  color: var(--text-muted);
}

.btn-save {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 var(--space-3);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-inverse);
  background: var(--accent-primary);
  border: none;
  border-radius: var(--radius-md);
}

.btn-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.save-hint-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
  text-decoration: none;
  white-space: nowrap;
}

.save-hint-link:hover {
  text-decoration: underline;
}

.export-wrap {
  position: relative;
}

.btn-export {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 32px;
  padding: 0 var(--space-3);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.btn-export:hover {
  border-color: var(--accent-primary);
  background: var(--accent-subtle);
  color: var(--accent-primary);
}

.btn-export__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.export-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 300;
  margin: 0;
  padding: var(--space-2);
  min-width: 260px;
  list-style: none;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(0, 230, 118, 0.06) inset;
}

.export-menu__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  margin: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.export-menu__item:hover {
  background: var(--accent-subtle);
}

.export-menu__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.export-menu__hint {
  font-size: 11px;
  line-height: 1.35;
  color: var(--text-muted);
  font-weight: 400;
}

.export-menu__sep {
  height: 1px;
  margin: var(--space-2) 0;
  background: var(--border-subtle);
  list-style: none;
}

.btn-proposal-cta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 32px;
  padding: 0 var(--space-4);
  background: var(--gradient-brand);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 12px rgba(0, 230, 118, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-proposal-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 230, 118, 0.4);
}

.btn-proposal-cta svg {
  width: 15px;
  height: 15px;
}

.btn-new {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 32px;
  padding: 0 var(--space-3);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
  flex-shrink: 0;
}

.btn-new:hover {
  background: var(--accent-subtle);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.btn-new--back {
  border-color: rgba(0, 230, 118, 0.38);
  color: var(--accent-primary);
}

.btn-new--back:hover {
  background: rgba(0, 230, 118, 0.1);
}

.btn-delete-saved {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 32px;
  padding: 0 var(--space-3);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: rgba(255, 120, 120, 0.95);
  background: rgba(200, 60, 60, 0.12);
  border: 1px solid rgba(220, 80, 80, 0.45);
  border-radius: var(--radius-md);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
  flex-shrink: 0;
}

.btn-delete-saved:hover:not(:disabled) {
  color: #ffc9c9;
  background: rgba(200, 60, 60, 0.22);
  border-color: rgba(255, 120, 120, 0.55);
  box-shadow: 0 0 24px rgba(200, 60, 60, 0.2);
}

.btn-delete-saved:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btn-delete-saved :deep(.brand-loader) {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.35));
}

.btn-delete-saved__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-new__icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .report-top {
    height: auto;
    min-height: 52px;
    padding: var(--space-3) var(--space-4);
    gap: var(--space-3);
  }

  .project-title {
    display: block;
    font-size: 12px;
    line-height: 1.35;
    text-align: right;
    max-width: min(52vw, 220px);
  }

  .wordmark {
    font-size: 15px;
  }
}
</style>
