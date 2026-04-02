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
  showSaveControls: boolean
  showLoginToSaveHint: boolean
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
        v-if="showSaveControls"
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
        v-else-if="showLoginToSaveHint"
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

<style scoped src="@/assets/styles/report-view-header.css"></style>
