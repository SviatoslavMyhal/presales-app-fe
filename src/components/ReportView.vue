<script setup lang="ts">
import ProposalDrawer from '@/components/ProposalDrawer.vue'
import ReportViewHeader from '@/components/report/ReportViewHeader.vue'
import ReportViewMain from '@/components/report/ReportViewMain.vue'
import ReportViewMobileDrawer from '@/components/report/ReportViewMobileDrawer.vue'
import ReportViewSidebar from '@/components/report/ReportViewSidebar.vue'
import { reportViewNavItems } from '@/config/reportViewNav'
import { useReportView, type ReportViewProps } from '@/composables/useReportView'

const props = withDefaults(
  defineProps<ReportViewProps>(),
  { variant: 'live', savedReportId: null, deleteInProgress: false }
)

const emit = defineEmits<{
  reset: []
  leave: []
  requestDelete: []
}>()

const navItems = reportViewNavItems

const {
  saveTitle,
  saving,
  canSave,
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
} = useReportView(props)
</script>

<template>
  <div
    v-if="report"
    class="report-page"
  >
    <ReportViewHeader
      v-model:save-title="saveTitle"
      v-model:export-menu-open="exportMenuOpen"
      :project-title="projectTitle"
      :variant="variant"
      :analyze-payload="analyzePayload"
      :can-save="canSave"
      :saving="saving"
      :can-show-proposal-cta="canShowProposalCta"
      :saved-report-id="savedReportId"
      :delete-in-progress="deleteInProgress"
      @save="saveToWorkspace"
      @export-markdown="exportMarkdown"
      @export-json="exportJson"
      @print-report="printReport"
      @open-proposal="proposalDrawerOpen = true"
      @leave="emit('leave')"
      @reset="emit('reset')"
      @request-delete="emit('requestDelete')"
    />

    <div class="report-layout">
      <ReportViewSidebar
        v-if="isDesktopNav"
        :nav-items="navItems"
        :active-section="activeSection"
        @scroll="scrollToSection"
      />
      <ReportViewMain
        :report="report"
        :intelligence="intelligence"
        :default-strategy="defaultStrategy"
      />
    </div>

    <ReportViewMobileDrawer
      v-model:drawer-open="drawerOpen"
      v-model:save-title="saveTitle"
      :show-mobile-nav="showMobileNav"
      :nav-items="navItems"
      :can-save="canSave"
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
  </div>
</template>

<style scoped>
.report-page {
  min-height: 100vh;
  background: var(--bg-base);
  padding-bottom: var(--space-12);
}

.report-layout {
  display: flex;
  gap: var(--space-8);
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-6);
}

@media (max-width: 768px) {
  .report-page {
    padding-bottom: calc(var(--space-16) + var(--space-4) + env(safe-area-inset-bottom, 0px));
  }

  .report-layout {
    padding: var(--space-4);
    max-width: 100%;
    width: 100%;
  }
}

</style>
