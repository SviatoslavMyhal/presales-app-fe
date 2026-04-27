<script setup lang="ts">
import ReportSourceBrief from '@/components/report/ReportSourceBrief.vue'
import type { IntelligenceResponse, SynthesisReport } from '@/types/presales'

withDefaults(
  defineProps<{
    report: SynthesisReport
    intelligence?: IntelligenceResponse | null
    defaultStrategy: {
      primary_goal: string
      focus_areas: string[]
      questions_to_lead_with: { question: string, reason: string }[]
      tone: string
      desired_outcome: string
    }
    /** Project / job description — shown as the first section when present. */
    jobPost?: string
    variant?: 'live' | 'saved'
    /** On-call mode: fewer sections, larger rhythm. */
    performMode?: boolean
  }>(),
  { variant: 'live', performMode: false },
)
</script>

<template>
  <main
    class="report-main"
    :class="{ 'report-main--perform': performMode }"
  >
    <ReportSourceBrief
      v-if="jobPost?.trim() && !performMode"
      :text="jobPost.trim()"
      :variant="variant"
    />

    <section
      v-if="!performMode"
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
      v-if="!performMode"
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
      v-if="!performMode"
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
</template>

<style scoped>
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

.report-main--perform {
  gap: var(--space-5);
}

.report-main--perform .section-body {
  font-size: 15px;
  line-height: 1.55;
}

.report-main--perform .section-label {
  font-size: 12px;
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

@media (max-width: 1023px) {
  .report-main {
    width: 100%;
    max-width: 100%;
  }

  .section-body--widgets {
    padding: var(--space-4);
  }
}
</style>
