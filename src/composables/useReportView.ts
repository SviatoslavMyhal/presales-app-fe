import { presalesAnalyzeSave } from '@/api/presales.api'
import { useAuthStore } from '@/stores/auth.store'
import type { IntelligenceResponse, PresalesRequest, SynthesisReport } from '@/types/presales'
import { formatApiError } from '@/utils/api-error'
import { buildStubIntelligenceForProposal } from '@/utils/storedReport'
import {
  downloadTextFile,
  reportExportDateStamp,
  synthesisReportToMarkdown,
} from '@/utils/exportReport'
import { onKeyStroke } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export type ReportViewProps = {
  report?: SynthesisReport
  analyzePayload?: PresalesRequest | null
  variant?: 'live' | 'saved'
  documentTitle?: string | null
  intelligence?: IntelligenceResponse | null
  jobPost?: string
  clientMessages?: string
  teamExpertise?: string
  constraints?: string
  savedReportId?: string | null
  deleteInProgress?: boolean
}

export function useReportView (props: ReportViewProps) {
  const auth = useAuthStore()
  const saveTitle = ref('')
  const saving = ref(false)
  /** After a successful save, hide title input + Save until a new report is shown */
  const reportSaved = ref(false)

  const canSave = computed(
    () => auth.isAuthenticated && Boolean(props.analyzePayload?.job_post?.trim()),
  )

  const showSaveControls = computed(() => canSave.value && !reportSaved.value)

  watch(
    () => props.report,
    () => {
      reportSaved.value = false
    },
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
      reportSaved.value = true
      ElMessage.success('Report saved to your workspace')
    } catch (e) {
      ElMessage.error(formatApiError(e))
    } finally {
      saving.value = false
    }
  }

  const activeSection = ref('intelligence')
  const proposalDrawerOpen = ref(false)
  const drawerOpen = ref(false)
  const isDesktopNav = ref(false)
  const showMobileNav = ref(false)
  const exportMenuOpen = ref(false)

  onKeyStroke('Escape', () => {
    exportMenuOpen.value = false
    if (proposalDrawerOpen.value) {
      proposalDrawerOpen.value = false
    }
  })

  function closeExportMenu () {
    exportMenuOpen.value = false
  }

  function closeMobileDrawer () {
    drawerOpen.value = false
  }

  function exportMarkdown () {
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

  function exportJson () {
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

  function printReport () {
    closeExportMenu()
    window.print()
  }

  let observer: IntersectionObserver | null = null

  function updateLayout () {
    if (typeof window === 'undefined') {
      return
    }
    const w = window.innerWidth
    isDesktopNav.value = w >= 1024
    /** Align with Tailwind lg: compact header + bottom sheet below desktop sidebar width */
    showMobileNav.value = w < 1024
  }

  function scrollToSection (id: string) {
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

  const proposalIntelligenceResolved = computed((): IntelligenceResponse => {
    if (props.intelligence?.status === 'success' && props.intelligence.data) {
      return props.intelligence
    }
    return buildStubIntelligenceForProposal()
  })

  const canShowProposalCta = computed(
    () => Boolean(props.report && proposalJobPost.value.trim().length > 0),
  )

  return {
    saveTitle,
    saving,
    showSaveControls,
    saveToWorkspace,
    activeSection,
    proposalDrawerOpen,
    drawerOpen,
    isDesktopNav,
    showMobileNav,
    exportMenuOpen,
    closeMobileDrawer,
    exportMarkdown,
    exportJson,
    printReport,
    scrollToSection,
    projectTitle,
    defaultStrategy,
    proposalJobPost,
    proposalIntelligenceResolved,
    canShowProposalCta,
  }
}
