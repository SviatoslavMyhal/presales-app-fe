<script setup lang="ts">
import ProposalDrawer from '@/components/ProposalDrawer.vue'
import ReportActionStrip from '@/components/report/ReportActionStrip.vue'
import ReportToolsDrawer from '@/components/tools/ReportToolsDrawer.vue'
import ReportViewHeader from '@/components/report/ReportViewHeader.vue'
import ReportViewMain from '@/components/report/ReportViewMain.vue'
import ReportViewMobileDrawer from '@/components/report/ReportViewMobileDrawer.vue'
import ReportViewSidebar from '@/components/report/ReportViewSidebar.vue'
import { reportViewNavItems } from '@/config/reportViewNav'
import { useReportView, type ReportViewProps } from '@/composables/useReportView'
import type { ReportKitTabId } from '@/types/report-kit'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<ReportViewProps>(),
  {
    variant: 'live',
    savedReportId: null,
    deleteInProgress: false,
    pipelineRisk: undefined,
    pipelineStrategy: undefined,
    workspaceMode: undefined,
    suppressTopInset: false,
  },
)

const emit = defineEmits<{
  reset: []
  leave: []
  requestDelete: []
}>()

/** Hide “Brief” nav when there is no job text to anchor. */
const navItems = computed(() => {
  if (props.jobPost?.trim()) {
    return reportViewNavItems
  }
  return reportViewNavItems.filter(item => item.id !== 'context')
})

const {
  saveTitle,
  saving,
  showSaveControls,
  saveToWorkspace,
  activeSection,
  proposalDrawerOpen,
  toolsDrawerOpen,
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
} = useReportView(props)

const toolsKitTab = ref<ReportKitTabId>('call')

function openCallKit(section?: ReportKitTabId) {
  toolsKitTab.value = section ?? 'call'
  toolsDrawerOpen.value = true
}
</script>

<template>
  <div
    v-if="report"
    class="report-page"
    :class="{
      'report-page--workspace-perform': props.workspaceMode === 'perform',
      'report-page--no-top-inset': props.suppressTopInset,
    }"
  >
    <ReportViewHeader
      v-model:save-title="saveTitle"
      v-model:export-menu-open="exportMenuOpen"
      :project-title="projectTitle"
      :variant="variant"
      :analyze-payload="analyzePayload"
      :show-save-controls="showSaveControls"
      :saving="saving"
      :can-show-proposal-cta="canShowProposalCta"
      :saved-report-id="savedReportId"
      :delete-in-progress="deleteInProgress"
      @save="saveToWorkspace"
      @export-markdown="exportMarkdown"
      @export-json="exportJson"
      @print-report="printReport"
      @open-proposal="proposalDrawerOpen = true"
      @open-tools="openCallKit('call')"
      @leave="emit('leave')"
      @reset="emit('reset')"
      @request-delete="emit('requestDelete')"
    />

    <ReportActionStrip
      v-if="canShowProposalCta && props.workspaceMode !== 'perform'"
      @open="openCallKit"
    />

    <div class="report-layout">
      <ReportViewSidebar
        v-if="isDesktopNav && props.workspaceMode !== 'perform'"
        :nav-items="navItems"
        :active-section="activeSection"
        @scroll="scrollToSection"
      />
      <ReportViewMain
        :report="report"
        :intelligence="intelligence"
        :default-strategy="defaultStrategy"
        :job-post="jobPost"
        :variant="variant"
        :perform-mode="props.workspaceMode === 'perform'"
      />
    </div>

    <ReportViewMobileDrawer
      v-model:drawer-open="drawerOpen"
      v-model:save-title="saveTitle"
      :show-mobile-nav="showMobileNav && props.workspaceMode !== 'perform'"
      :nav-items="navItems"
      :show-save-controls="showSaveControls"
      :saving="saving"
      :variant="variant"
      :analyze-payload="analyzePayload"
      :can-show-proposal-cta="canShowProposalCta"
      :saved-report-id="savedReportId"
      :delete-in-progress="deleteInProgress"
      @scroll="scrollToSection"
      @save="saveToWorkspace"
      @export-markdown="exportMarkdown"
      @export-json="exportJson"
      @print-report="printReport"
      @open-proposal="proposalDrawerOpen = true"
      @open-tools="openCallKit('call')"
      @leave="emit('leave')"
      @reset="emit('reset')"
      @request-delete="emit('requestDelete')"
      @close="closeMobileDrawer"
    />

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

    <ReportToolsDrawer
      v-if="canShowProposalCta"
      :visible="toolsDrawerOpen"
      :initial-tab="toolsKitTab"
      :report="report"
      :intelligence="proposalIntelligenceResolved"
      :job-post="proposalJobPost"
      :client-messages="clientMessages"
      :team-expertise="teamExpertise"
      :constraints="constraints"
      :pipeline-risk="pipelineRisk"
      :pipeline-strategy="pipelineStrategy"
      @close="toolsDrawerOpen = false"
    />
  </div>
</template>

<style scoped>
/* Offset for position:fixed report header (report-view-header.css) */
.report-page {
  --report-header-gap: calc(60px + env(safe-area-inset-top, 0px));
  min-height: 100vh;
  background: var(--bg-base);
  padding-top: var(--report-header-gap);
  padding-bottom: var(--space-12);
}

/* Desktop toolbar wraps to two rows between lg and xl */
@media (min-width: 1024px) and (max-width: 1200px) {
  .report-page {
    --report-header-gap: calc(104px + env(safe-area-inset-top, 0px));
  }
}

@media (min-width: 1201px) {
  .report-page {
    --report-header-gap: calc(60px + env(safe-area-inset-top, 0px));
  }
}

@media (max-width: 1023px) {
  .report-page {
    --report-header-gap: calc(56px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(var(--space-16) + var(--space-4) + env(safe-area-inset-bottom, 0px));
  }

  .report-layout {
    padding: var(--space-4);
    max-width: 100%;
    width: 100%;
  }
}

.report-page--no-top-inset {
  padding-top: 0;
}

@media print {
  .report-page {
    padding-top: 0;
  }
}

.report-layout {
  display: flex;
  gap: var(--space-8);
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-6);
}

</style>
