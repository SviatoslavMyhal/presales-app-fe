<script setup lang="ts">
import WidgetRow from '@/components/widgets/WidgetRow.vue'
import FinalPrepNote from '@/components/sections/FinalPrepNote.vue'
import OpportunitySummary from '@/components/sections/OpportunitySummary.vue'
import ClientNeeds from '@/components/sections/ClientNeeds.vue'
import DiscoveryQuestions from '@/components/sections/DiscoveryQuestions.vue'
import Risks from '@/components/sections/Risks.vue'
import SuggestedPositioning from '@/components/sections/SuggestedPositioning.vue'
import SolutionApproach from '@/components/sections/SolutionApproach.vue'
import CallStrategy from '@/components/sections/CallStrategy.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import ProposalDrawer from '@/components/ProposalDrawer.vue'
import { presalesAnalyzeSave } from '@/api/presales.api'
import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'
import type { IntelligenceResponse, PresalesRequest, SynthesisReport } from '@/types/presales'
import { formatApiError } from '@/utils/api-error'
import { buildStubIntelligenceForProposal } from '@/utils/storedReport'
import {
  downloadTextFile,
  reportExportDateStamp,
  synthesisReportToMarkdown,
} from '@/utils/exportReport'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    report?: SynthesisReport
    /** Original analyze form payload — used for “Save to workspace” when logged in */
    analyzePayload?: PresalesRequest | null
    /** `saved` = opened from My reports; secondary action goes back to list instead of new analysis */
    variant?: 'live' | 'saved'
    /** When set (e.g. saved report title), shown in the sticky header instead of truncating the summary */
    documentTitle?: string | null
    /** Intelligence block from analyze API; missing or error shows fallback in the Intelligence section */
    intelligence?: IntelligenceResponse | null
    /** Original analyze inputs — used for proposal generation */
    jobPost?: string
    clientMessages?: string
    teamExpertise?: string
    constraints?: string
    /** When viewing a saved report from the API — enables delete in header / mobile menu */
    savedReportId?: string | null
    deleteInProgress?: boolean
  }>(),
  { variant: 'live', savedReportId: null, deleteInProgress: false }
)

const auth = useAuthStore()
const saveTitle = ref('')
const saving = ref(false)

const canSave = computed(
  () => auth.isAuthenticated && Boolean(props.analyzePayload?.job_post?.trim()),
)

async function saveToWorkspace () {
  const p = props.analyzePayload
  if (!p?.job_post?.trim()) {
    return
  }
  saving.value = true
  try {
    await presalesAnalyzeSave({
      job_post: p.job_post.trim(),
      ...(p.client_messages?.trim() ? { client_messages: p.client_messages.trim() } : {}),
      ...(p.team_expertise?.trim() ? { team_expertise: p.team_expertise.trim() } : {}),
      ...(p.constraints?.trim() ? { constraints: p.constraints.trim() } : {}),
      ...(saveTitle.value.trim() ? { title: saveTitle.value.trim() } : {})
    })
    ElMessage.success('Report saved to your workspace')
  } catch (e) {
    ElMessage.error(formatApiError(e))
  } finally {
    saving.value = false
  }
}

const emit = defineEmits<{
  reset: []
  /** When variant is `saved`, user chose to leave back to the reports list */
  leave: []
  /** User chose to delete the saved report (parent runs confirm + API) */
  requestDelete: []
}>()

const navItems = [
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  },
  {
    id: 'prep-note',
    label: 'Prep Note',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 'summary',
    label: 'Opportunity',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  },
  {
    id: 'needs',
    label: 'Client Needs',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'questions',
    label: 'Discovery',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  {
    id: 'positioning',
    label: 'Positioning',
    icon: 'M7 11l5-5m0 0l5 5m-5-5v12',
  },
  {
    id: 'approach',
    label: 'Approach',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    id: 'strategy',
    label: 'Call Strategy',
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  },
]

const activeSection = ref('intelligence')
const proposalDrawerOpen = ref(false)
const drawerOpen = ref(false)
const isDesktopNav = ref(false)
const showMobileNav = ref(false)
const exportMenuOpen = ref(false)
const exportRootRef = ref<HTMLElement | null>(null)

onClickOutside(exportRootRef, () => {
  exportMenuOpen.value = false
})

onKeyStroke('Escape', () => {
  exportMenuOpen.value = false
  if (proposalDrawerOpen.value) {
    proposalDrawerOpen.value = false
  }
})

function closeExportMenu() {
  exportMenuOpen.value = false
}

function closeMobileDrawer () {
  drawerOpen.value = false
}

function exportMarkdown() {
  if (!props.report) {
    return
  }
  const stamp = reportExportDateStamp()
  downloadTextFile(
    `presales-report-${stamp}.md`,
    synthesisReportToMarkdown(props.report),
    'text/markdown;charset=utf-8',
  )
  closeExportMenu()
}

function exportJson() {
  if (!props.report) {
    return
  }
  const stamp = reportExportDateStamp()
  downloadTextFile(
    `presales-report-${stamp}.json`,
    `${JSON.stringify(props.report, null, 2)}\n`,
    'application/json;charset=utf-8',
  )
  closeExportMenu()
}

function printReport() {
  closeExportMenu()
  window.print()
}

let observer: IntersectionObserver | null = null

function updateLayout() {
  if (typeof window === 'undefined') {
    return
  }
  const w = window.innerWidth
  isDesktopNav.value = w >= 1024
  showMobileNav.value = w <= 768
}

function scrollToSection(id: string) {
  document.querySelector(`[data-section="${id}"]`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
  drawerOpen.value = false
}

onMounted(() => {
  updateLayout()
  window.addEventListener('resize', updateLayout)

  void nextTick(() => {
    const sections = document.querySelectorAll('[data-section]')
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section')
            if (id) {
              activeSection.value = id
            }
          }
        })
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      },
    )
    sections.forEach(el => observer?.observe(el))
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout)
  observer?.disconnect()
  observer = null
})

const projectTitle = computed(() => {
  const doc = props.documentTitle?.trim()
  if (doc) {
    return doc.length > 55 ? `${doc.slice(0, 55)}…` : doc
  }
  const s = props.report?.opportunity_summary?.trim()
  if (!s) {
    return 'Analysis'
  }
  return s.length > 55 ? `${s.slice(0, 55)}…` : s
})

const defaultStrategy = {
  primary_goal: '',
  focus_areas: [] as string[],
  questions_to_lead_with: [] as { question: string, reason: string }[],
  tone: '',
  desired_outcome: '',
}

/** Job context for the proposal API: saved form text, or synthesis fields when `job_post` wasn’t persisted. */
const proposalJobPost = computed(() => {
  const j = props.jobPost?.trim()
  if (j) {
    return j
  }
  const r = props.report
  if (!r) {
    return ''
  }
  return (
    r.opportunity_summary?.trim()
    || r.client_needs?.main_need?.trim()
    || ''
  )
})

/** Live intelligence from analyze, or a minimal stub so proposal generation works for legacy saved reports. */
const proposalIntelligenceResolved = computed((): IntelligenceResponse => {
  if (props.intelligence?.status === 'success' && props.intelligence.data) {
    return props.intelligence
  }
  return buildStubIntelligenceForProposal()
})

const canShowProposalCta = computed(
  () => Boolean(props.report && proposalJobPost.value.trim().length > 0),
)
</script>

<template>
  <div
    v-if="report"
    class="report-page"
  >
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
            @click="saveToWorkspace"
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
                @click="exportMarkdown"
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
                @click="exportJson"
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
                @click="printReport"
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
          @click="proposalDrawerOpen = true"
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

    <div class="report-layout">
      <aside
        v-if="isDesktopNav"
        class="report-sidebar"
      >
        <nav
          class="report-nav"
          aria-label="Sections"
        >
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            class="nav-item"
            :class="{ active: activeSection === item.id }"
            @click="scrollToSection(item.id)"
          >
            <svg
              class="nav-icon"
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
      </aside>

      <main class="report-main">
        <section
          id="intelligence"
          class="report-section"
          data-section="intelligence"
        >
          <div class="section-header">
            <span class="section-label">Intelligence</span>
          </div>
          <div class="section-body section-body--widgets">
            <WidgetRow
              v-if="intelligence?.data"
              :intelligence="intelligence.data"
            />
            <div
              v-else
              class="intelligence-error"
            >
              <span>Intelligence analysis unavailable</span>
            </div>
          </div>
        </section>

        <section
          id="prep-note"
          class="report-section report-section--prep"
          data-section="prep-note"
        >
          <div class="section-header">
            <span class="section-label">Prep Note</span>
          </div>
          <div class="section-body section-body--prep">
            <FinalPrepNote :note="report.final_prep_note" />
          </div>
        </section>

        <section
          id="summary"
          class="report-section report-section--summary"
          data-section="summary"
        >
          <div class="section-header section-header--glow">
            <span class="section-label">Opportunity</span>
          </div>
          <div class="section-body section-body--summary">
            <OpportunitySummary :summary="report.opportunity_summary" />
          </div>
        </section>

        <section
          id="needs"
          class="report-section report-section--needs"
          data-section="needs"
        >
          <div class="section-header">
            <span class="section-label">Client Needs</span>
          </div>
          <div class="section-body section-body--needs">
            <ClientNeeds
              :needs="report.client_needs ?? { main_need: '', hidden_needs: [] }"
            />
          </div>
        </section>

        <section
          id="questions"
          class="report-section"
          data-section="questions"
        >
          <div class="section-header">
            <span class="section-label">Discovery</span>
          </div>
          <div class="section-body">
            <DiscoveryQuestions :questions="report.discovery_questions ?? []" />
          </div>
        </section>

        <section
          id="risks"
          class="report-section"
          data-section="risks"
        >
          <div class="section-header">
            <span class="section-label">Risks</span>
          </div>
          <div class="section-body">
            <Risks :risks="report.risks ?? []" />
          </div>
        </section>

        <section
          id="positioning"
          class="report-section"
          data-section="positioning"
        >
          <div class="section-header">
            <span class="section-label">Positioning</span>
          </div>
          <div class="section-body">
            <SuggestedPositioning :positioning="report.suggested_positioning ?? []" />
          </div>
        </section>

        <section
          id="approach"
          class="report-section"
          data-section="approach"
        >
          <div class="section-header">
            <span class="section-label">Approach</span>
          </div>
          <div class="section-body">
            <SolutionApproach :approach="report.solution_approach ?? []" />
          </div>
        </section>

        <section
          id="strategy"
          class="report-section"
          data-section="strategy"
        >
          <div class="section-header">
            <span class="section-label">Call Strategy</span>
          </div>
          <div class="section-body">
            <CallStrategy
              :strategy="report.call_strategy ?? defaultStrategy"
            />
          </div>
        </section>
      </main>
    </div>

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
              @click="closeMobileDrawer"
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
              @click="scrollToSection(item.id)"
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
                @click="saveToWorkspace(); closeMobileDrawer()"
              >
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>

          <RouterLink
            v-else-if="variant === 'live' && analyzePayload"
            :to="{ name: routeNames.login, query: { redirect: '/' } }"
            class="mobile-sheet__login-hint"
            @click="closeMobileDrawer"
          >
            Log in to save reports
          </RouterLink>

          <div class="mobile-sheet__action-group">
            <span class="mobile-sheet__label">Export</span>
            <button
              type="button"
              class="mobile-sheet__btn mobile-sheet__btn--secondary"
              @click="exportMarkdown(); closeMobileDrawer()"
            >
              Markdown (.md)
            </button>
            <button
              type="button"
              class="mobile-sheet__btn mobile-sheet__btn--secondary"
              @click="exportJson(); closeMobileDrawer()"
            >
              JSON
            </button>
            <button
              type="button"
              class="mobile-sheet__btn mobile-sheet__btn--secondary"
              @click="printReport(); closeMobileDrawer()"
            >
              Print / Save as PDF
            </button>
          </div>

          <button
            v-if="canShowProposalCta"
            type="button"
            class="mobile-sheet__btn mobile-sheet__btn--cta"
            @click="proposalDrawerOpen = true; closeMobileDrawer()"
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
            @click="emit('leave'); closeMobileDrawer()"
          >
            Back to reports
          </button>
          <button
            v-else
            type="button"
            class="mobile-sheet__btn mobile-sheet__btn--secondary"
            @click="emit('reset'); closeMobileDrawer()"
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

    <ProposalDrawer
      v-if="canShowProposalCta"
      :visible="proposalDrawerOpen"
      :report="report"
      :intelligence="proposalIntelligenceResolved"
      :job-post="proposalJobPost"
      :client-messages="clientMessages"
      :team-expertise="teamExpertise"
      :constraints="constraints"
      @close="proposalDrawerOpen = false"
    />
  </div>
</template>

<style scoped>
.report-page {
  min-height: 100vh;
  background: var(--bg-base);
  padding-bottom: var(--space-12);
}

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

.report-layout {
  display: flex;
  gap: var(--space-8);
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-6);
}

.report-sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 72px;
  align-self: flex-start;
}

.report-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-left: 2px solid transparent;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  border-top: none;
  border-right: none;
  border-bottom: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.nav-item.active {
  color: var(--accent-primary);
  background: var(--accent-subtle);
  border-left-color: var(--accent-primary);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.report-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.report-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  scroll-margin-top: 80px;
}

.report-section--prep {
  position: relative;
  background: var(--gradient-brand-subtle);
  border-color: var(--border-default);
  box-shadow:
    0 0 0 1px var(--border-subtle),
    0 16px 48px var(--accent-subtle);
}

.report-section--prep::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: min(40%, 200px);
  height: min(40%, 200px);
  background: radial-gradient(
    circle at 100% 0%,
    var(--accent-subtle) 0%,
    transparent 72%
  );
  pointer-events: none;
  opacity: 0.85;
}

.report-section--summary {
  position: relative;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
}

.report-section--summary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 90% 55% at 100% 0%,
    var(--accent-subtle) 0%,
    transparent 65%
  );
  pointer-events: none;
  opacity: 0.55;
}

.report-section--needs {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-default);
  border-left: 3px solid var(--accent-primary);
  background: linear-gradient(
    180deg,
    var(--bg-surface) 0%,
    var(--bg-base) 100%
  );
}

.section-header {
  position: relative;
  z-index: 1;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(0, 230, 118, 0.02);
}

.section-header--glow {
  background: linear-gradient(
    90deg,
    var(--accent-subtle) 0%,
    transparent 55%
  );
}

.report-section--prep .section-header {
  background: transparent;
  border-color: var(--border-default);
}

.section-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 500;
}

.section-body {
  position: relative;
  z-index: 1;
  padding: var(--space-6);
}

.section-body--widgets {
  padding: var(--space-6) var(--space-8);
}

.intelligence-error {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

.report-main :deep(.section-title) {
  display: none;
}

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

  .report-page {
    padding-bottom: calc(var(--space-16) + var(--space-4) + env(safe-area-inset-bottom, 0px));
  }

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

  .report-layout {
    padding: var(--space-4);
    max-width: 100%;
    width: 100%;
  }

  .report-main {
    width: 100%;
    max-width: 100%;
  }

  .section-body--widgets {
    padding: var(--space-4);
  }
}

@media (max-width: 1023px) {
  .report-sidebar {
    display: none;
  }
}

/* Mobile bottom sheet — dark surface, no default Element Plus white header */
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
