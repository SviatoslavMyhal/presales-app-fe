<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { routeNames } from '@/router/route-names-registry'
import type { PresalesRequest } from '@/types/presales'

const drawerOpen = defineModel<boolean>('drawerOpen', { required: true })
const saveTitle = defineModel<string>('saveTitle', { default: '' })

defineProps<{
  showMobileNav: boolean
  navItems: readonly { id: string; label: string; icon: string }[]
  canSave: boolean
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
  leave: []
  reset: []
  requestDelete: []
  close: []
}>()

function onScroll (id: string) {
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
          v-if="canSave"
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

        <RouterLink
          v-else-if="variant === 'live' && analyzePayload"
          :to="{ name: routeNames.login, query: { redirect: '/' } }"
          class="mobile-sheet__login-hint"
          @click="emit('close')"
        >
          Log in to save reports
        </RouterLink>

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

<style scoped>
.mobile-nav-trigger {
  position: fixed;
  left: 50%;
  right: auto;
  bottom: calc(var(--space-5) + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 999px;
  padding: var(--space-3) var(--space-5);
  min-height: 44px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  z-index: 200;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(0, 230, 118, 0.12);
  display: none;
  align-items: center;
  gap: var(--space-2);
  font-family: inherit;
}

@media (max-width: 768px) {
  .mobile-nav-trigger {
    display: inline-flex;
  }
}

.report-mobile-drawer :deep(.el-drawer) {
  background: var(--bg-overlay) !important;
  border: 1px solid var(--border-subtle) !important;
  border-bottom: none !important;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0 !important;
  box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.55) !important;
}

.report-mobile-drawer :deep(.el-drawer__body) {
  padding: 0 !important;
  background: transparent !important;
}

.drawer-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  text-align: left;
  padding: var(--space-4) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.35;
}

.drawer-link__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  opacity: 0.85;
}

.drawer-link:hover {
  background: var(--accent-subtle);
  color: var(--accent-primary);
}

.mobile-sheet {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  min-height: 0;
  max-height: min(82vh, 100%);
  padding: 0 var(--space-5) var(--space-6);
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom, 0px));
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-sheet__chrome {
  flex-shrink: 0;
  padding-top: var(--space-2);
  margin: 0 calc(-1 * var(--space-5));
  padding-left: var(--space-5);
  padding-right: var(--space-5);
}

.mobile-sheet__grab {
  width: 40px;
  height: 5px;
  margin: 0 auto var(--space-4);
  border-radius: 100px;
  background: var(--text-muted);
  opacity: 0.35;
}

.mobile-sheet__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.mobile-sheet__title-main {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--text-primary);
}

.mobile-sheet__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-right: calc(-1 * var(--space-2));
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.mobile-sheet__close:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.mobile-sheet__close:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.mobile-sheet__section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mobile-sheet__section--actions {
  padding-top: var(--space-5);
  margin-top: var(--space-1);
  border-top: 1px solid var(--border-subtle);
}

.mobile-sheet__heading {
  margin: 0 0 var(--space-4);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.mobile-sheet__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mobile-sheet__label {
  display: block;
  margin-bottom: var(--space-3);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.mobile-sheet__save {
  margin-bottom: var(--space-5);
}

.mobile-sheet__save-row {
  display: flex;
  gap: var(--space-3);
  align-items: stretch;
}

.mobile-sheet__input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 var(--space-3);
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.mobile-sheet__input::placeholder {
  color: var(--text-muted);
}

.mobile-sheet__action-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.mobile-sheet__login-hint {
  display: block;
  margin-bottom: var(--space-5);
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-primary);
  text-decoration: none;
}

.mobile-sheet__login-hint:hover {
  text-decoration: underline;
}

.mobile-sheet__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.mobile-sheet__btn--primary {
  flex: 0 0 auto;
  width: auto;
  min-width: 88px;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
  color: var(--text-inverse);
  background: var(--accent-primary);
}

.mobile-sheet__btn--primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.mobile-sheet__btn--secondary {
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
}

.mobile-sheet__btn--secondary:hover {
  border-color: var(--accent-primary);
  background: var(--accent-subtle);
  color: var(--accent-primary);
}

.mobile-sheet__btn--cta {
  margin-bottom: var(--space-4);
  background: var(--gradient-brand);
  color: var(--text-inverse);
  box-shadow: 0 2px 16px rgba(0, 230, 118, 0.22);
}

.mobile-sheet__btn--cta svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.mobile-sheet__danger {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid rgba(220, 80, 80, 0.22);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mobile-sheet__label--danger {
  margin-bottom: 0;
  color: rgba(255, 140, 140, 0.85);
}

.mobile-sheet__danger-hint {
  margin: 0 0 var(--space-3);
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.mobile-sheet__btn--danger {
  color: #fff !important;
  background: linear-gradient(
    145deg,
    rgba(200, 60, 60, 0.95) 0%,
    rgba(150, 40, 50, 0.98) 100%
  ) !important;
  border: 1px solid rgba(255, 100, 100, 0.35) !important;
  box-shadow: 0 4px 20px rgba(160, 40, 50, 0.35);
}

.mobile-sheet__btn--danger:hover:not(:disabled) {
  filter: brightness(1.06);
}

.mobile-sheet__btn--danger:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.mobile-sheet__btn--danger :deep(.brand-loader) {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
}
</style>
