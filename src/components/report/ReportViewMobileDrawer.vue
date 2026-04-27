<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import type { PresalesRequest } from '@/types/presales'

const drawerOpen = defineModel<boolean>('drawerOpen', { required: true })
const saveTitle = defineModel<string>('saveTitle', { default: '' })

defineProps<{
  showMobileNav: boolean
  navItems: readonly { id: string, label: string, icon: string }[]
  showSaveControls: boolean
  saving: boolean
  variant: 'live' | 'saved'
  analyzePayload?: PresalesRequest | null
  canShowProposalCta: boolean
  savedReportId?: string | null
  deleteInProgress?: boolean
}>()

const emit = defineEmits<{
  scroll: [id: string]
  save: []
  exportMarkdown: []
  exportJson: []
  printReport: []
  openProposal: []
  openTools: []
  leave: []
  reset: []
  requestDelete: []
  close: []
}>()

function onScroll(id: string) {
  emit('scroll', id)
}
</script>

<template>
  <button
    v-if="showMobileNav"
    type="button"
    class="mobile-nav-trigger"
    aria-haspopup="dialog"
    :aria-expanded="drawerOpen"
    @click="drawerOpen = true"
  >
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
    Report
  </button>

  <el-drawer
    v-model="drawerOpen"
    direction="btt"
    size="82%"
    class="report-mobile-drawer"
    append-to-body
    :with-header="false"
    body-class="report-mobile-drawer__body"
    title="Report menu"
  >
    <div class="mobile-sheet">
      <div class="mobile-sheet__chrome">
        <div
          class="mobile-sheet__grab"
          aria-hidden="true"
        />
        <div class="mobile-sheet__header-row">
          <h2
            id="report-menu-title"
            class="mobile-sheet__title-main"
          >
            Report menu
          </h2>
          <button
            type="button"
            class="mobile-sheet__close"
            aria-label="Close menu"
            @click="emit('close')"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M18 6L6 18M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <section
        class="mobile-sheet__section"
        aria-labelledby="mobile-nav-heading"
      >
        <h2
          id="mobile-nav-heading"
          class="mobile-sheet__heading"
        >
          Jump to section
        </h2>
        <nav
          class="mobile-sheet__nav"
          aria-label="Report sections"
        >
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            class="drawer-link"
            @click="onScroll(item.id)"
          >
            <svg
              class="drawer-link__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                :d="item.icon"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </section>

      <section
        class="mobile-sheet__section mobile-sheet__section--actions"
        aria-labelledby="mobile-actions-heading"
      >
        <h2
          id="mobile-actions-heading"
          class="mobile-sheet__heading"
        >
          Workspace
        </h2>

        <div
          v-if="showSaveControls"
          class="mobile-sheet__save"
        >
          <label
            class="mobile-sheet__label"
            for="mobile-save-title"
          >Title (optional)</label>
          <div class="mobile-sheet__save-row">
            <input
              id="mobile-save-title"
              v-model="saveTitle"
              type="text"
              class="mobile-sheet__input"
              placeholder="e.g. ACME — discovery call"
              autocomplete="off"
            >
            <button
              type="button"
              class="mobile-sheet__btn mobile-sheet__btn--primary"
              :disabled="saving"
              @click="emit('save'); emit('close')"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>

        <div class="mobile-sheet__action-group">
          <span class="mobile-sheet__label">Export</span>
          <button
            type="button"
            class="mobile-sheet__btn mobile-sheet__btn--secondary"
            @click="emit('exportMarkdown'); emit('close')"
          >
            Markdown (.md)
          </button>
          <button
            type="button"
            class="mobile-sheet__btn mobile-sheet__btn--secondary"
            @click="emit('exportJson'); emit('close')"
          >
            JSON
          </button>
          <button
            type="button"
            class="mobile-sheet__btn mobile-sheet__btn--secondary"
            @click="emit('printReport'); emit('close')"
          >
            Print / Save as PDF
          </button>
        </div>

        <button
          v-if="canShowProposalCta"
          type="button"
          class="mobile-sheet__btn mobile-sheet__btn--secondary"
          @click="emit('openTools'); emit('close')"
        >
          Call kit
        </button>
        <button
          v-if="canShowProposalCta"
          type="button"
          class="mobile-sheet__btn mobile-sheet__btn--cta"
          @click="emit('openProposal'); emit('close')"
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
          Generate proposal draft
        </button>

        <button
          v-if="variant === 'saved'"
          type="button"
          class="mobile-sheet__btn mobile-sheet__btn--secondary"
          @click="emit('leave'); emit('close')"
        >
          Back to reports
        </button>
        <button
          v-else
          type="button"
          class="mobile-sheet__btn mobile-sheet__btn--secondary"
          @click="emit('reset'); emit('close')"
        >
          New analysis
        </button>

        <div
          v-if="variant === 'saved' && savedReportId"
          class="mobile-sheet__danger"
        >
          <span class="mobile-sheet__label mobile-sheet__label--danger">Danger zone</span>
          <p class="mobile-sheet__danger-hint">
            Permanently remove this report from your workspace.
          </p>
          <button
            type="button"
            class="mobile-sheet__btn mobile-sheet__btn--danger"
            :disabled="deleteInProgress"
            @click="emit('requestDelete')"
          >
            <BrandLoader
              v-if="deleteInProgress"
              size="xs"
            />
            <span v-if="deleteInProgress">Deleting…</span>
            <span v-else>Delete report</span>
          </button>
        </div>
      </section>
    </div>
  </el-drawer>
</template>

<style scoped src="@/assets/styles/report-view-mobile-drawer.css"></style>
