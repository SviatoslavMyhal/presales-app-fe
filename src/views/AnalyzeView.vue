<script setup lang="ts">
import AgentProgress from '@/components/AgentProgress.vue'
import ReportView from '@/components/ReportView.vue'
import StepForm from '@/components/StepForm.vue'
import { analyzePresales } from '@/api/presales'
import type { PresalesAnalyzeResult } from '@/api/backend-types'
import type { PresalesRequest, PresalesResponse } from '@/types/presales'
import { formatApiError } from '@/utils/api-error'
import {
  getPresalesPipelineFailureMessage,
  isPresalesPipelineFailed,
} from '@/utils/presalesPipeline'
import { routeNames } from '@/router/route-names-registry'
import { ElMessage } from 'element-plus'
import type { Component } from 'vue'

const router = useRouter()

type Phase = 'form' | 'loading' | 'report'

const phase = ref<Phase>('form')
const currentComponent = shallowRef<Component>(StepForm)
/** Bumps on "New analysis" so KeepAlive does not restore stale step index / fields */
const stepFormKey = ref(0)
const result = ref<PresalesAnalyzeResult | null>(null)
const error = ref<string | null>(null)
const submittedPayload = ref<PresalesRequest | null>(null)

const componentProps = computed(() => {
  const r = result.value
  switch (phase.value) {
    case 'form':
      return {
        initialPayload: submittedPayload.value,
        error: error.value
      }
    case 'loading':
      return {
        result: r,
        error: error.value
      }
    case 'report':
      return {
        report: r?.synthesis?.report,
        intelligence: (r as PresalesResponse | null | undefined)?.intelligence,
        analyzePayload: submittedPayload.value,
        jobPost: submittedPayload.value?.job_post,
        clientMessages: submittedPayload.value?.client_messages,
        teamExpertise: submittedPayload.value?.team_expertise,
        constraints: submittedPayload.value?.constraints
      }
    default:
      return {}
  }
})

function goHome () {
  void router.push({ name: routeNames.home })
}

async function handleFormSubmit (payload: PresalesRequest) {
  submittedPayload.value = payload
  phase.value = 'loading'
  currentComponent.value = AgentProgress
  error.value = null
  try {
    const res = await analyzePresales(payload)
    if (isPresalesPipelineFailed(res)) {
      const msg = getPresalesPipelineFailureMessage(res)
      result.value = null
      submittedPayload.value = null
      error.value = null
      ElMessage.error({
        message: msg,
        duration: 0,
        showClose: true,
      })
      await nextTick()
      await router.replace({ name: routeNames.home })
      return
    }
    result.value = res
    await nextTick()
    phase.value = 'report'
    currentComponent.value = ReportView
  } catch (e: unknown) {
    error.value = formatApiError(e)
    phase.value = 'form'
    currentComponent.value = StepForm
  }
}

function handleReset () {
  result.value = null
  submittedPayload.value = null
  error.value = null
  stepFormKey.value++
  phase.value = 'form'
  currentComponent.value = StepForm
}
</script>

<template>
  <div class="analyze-view-root">
    <div
      class="analyze-bg"
      aria-hidden="true"
    >
      <div class="analyze-bg__blob analyze-bg__blob--a" />
      <div class="analyze-bg__blob analyze-bg__blob--b" />
      <div class="analyze-bg__mesh" />
      <div class="analyze-bg__glow" />
    </div>

    <div class="analyze-inner">
      <div
        class="analyze-body"
        :class="{ 'analyze-body--narrow': phase === 'form' }"
      >
        <header
          v-if="phase === 'form'"
          class="analyze-masthead"
        >
          <p class="analyze-masthead__kicker">
            Workspace
          </p>
          <h1 class="analyze-masthead__title">
            New analysis
          </h1>
          <p class="analyze-masthead__lede">
            Step through your client context — four AI agents will build your presales report.
          </p>
        </header>

        <KeepAlive include="StepForm">
          <component
            :is="currentComponent"
            :key="stepFormKey"
            v-bind="componentProps"
            @submit="handleFormSubmit"
            @reset="handleReset"
            @back="goHome"
          />
        </KeepAlive>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analyze-view-root {
  position: relative;
  min-height: 100%;
  min-height: min(100vh, 100dvh);
  background: var(--bg-base);
  overflow-x: hidden;
}

/* Ambient layers — same language as home splash, calmer for a task screen */
.analyze-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.analyze-bg__blob {
  position: absolute;
  border-radius: 50%;
  will-change: transform, opacity;
}

.analyze-bg__blob--a {
  width: min(90vw, 560px);
  height: min(90vw, 560px);
  top: -20%;
  left: -25%;
  background: radial-gradient(
    circle at 40% 40%,
    rgba(0, 230, 118, 0.1) 0%,
    rgba(0, 137, 123, 0.035) 48%,
    transparent 70%
  );
  animation: analyze-aurora-a 24s ease-in-out infinite alternate;
}

.analyze-bg__blob--b {
  width: min(80vw, 500px);
  height: min(80vw, 500px);
  bottom: -22%;
  right: -20%;
  background: radial-gradient(
    circle at 55% 50%,
    rgba(0, 188, 212, 0.07) 0%,
    rgba(0, 230, 118, 0.04) 45%,
    transparent 68%
  );
  animation: analyze-aurora-b 28s ease-in-out infinite alternate;
}

.analyze-bg__mesh {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image:
    linear-gradient(rgba(0, 230, 118, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 230, 118, 0.028) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 75% 65% at 50% 42%, black 0%, transparent 78%);
  animation: analyze-mesh-drift 56s linear infinite;
}

.analyze-bg__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 55% 42% at 50% 38%,
    rgba(0, 230, 118, 0.055) 0%,
    transparent 65%
  );
}

.analyze-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding:
    calc(var(--space-8) + env(safe-area-inset-top, 0px))
    clamp(var(--space-4), 4vw, var(--space-8))
    calc(var(--space-12) + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.analyze-body--narrow {
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

.analyze-masthead {
  text-align: center;
  margin-bottom: clamp(1.25rem, 4vw, 2rem);
  padding: 0 clamp(0.25rem, 2vw, 1rem);
}

.analyze-masthead__kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent-primary);
  opacity: 0.92;
}

.analyze-masthead__title {
  margin: 0 0 var(--space-3);
  font-size: clamp(1.35rem, 3.5vw, 1.65rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.analyze-masthead__lede {
  margin: 0 auto;
  max-width: 36rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.analyze-body {
  position: relative;
}

/* Let the shared flow show the ambient bg (only used from this route) */
.analyze-view-root :deep(.agent-progress) {
  background: transparent;
  min-height: min(100vh, 100dvh);
}

.analyze-view-root :deep(.report-page) {
  background: transparent;
}

/* Step form: glass card + depth */
.analyze-view-root :deep(.step-form) {
  min-height: auto;
  padding-top: 0;
  padding-left: 0;
  padding-right: 0;
}

.analyze-view-root :deep(.form-card) {
  border: 1px solid rgba(0, 230, 118, 0.16);
  background: linear-gradient(
    165deg,
    rgba(18, 24, 20, 0.92) 0%,
    rgba(10, 14, 12, 0.88) 100%
  );
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.06) inset,
    0 20px 56px rgba(0, 0, 0, 0.45),
    0 0 80px rgba(0, 230, 118, 0.04);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.analyze-view-root :deep(.segment--active) {
  animation: none;
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.35);
}

.analyze-view-root :deep(.btn-ghost) {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(0, 230, 118, 0.22);
}

@media (max-width: 768px) {
  .analyze-masthead {
    margin-bottom: var(--space-5);
  }

  .analyze-masthead__lede {
    font-size: 0.875rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .analyze-bg__blob--a,
  .analyze-bg__blob--b,
  .analyze-bg__mesh {
    animation: none;
  }
}

@keyframes analyze-aurora-a {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.85;
  }
  100% {
    transform: translate(6%, 5%) scale(1.06);
    opacity: 0.58;
  }
}

@keyframes analyze-aurora-b {
  0% {
    transform: translate(0, 0) scale(1.04);
    opacity: 0.72;
  }
  100% {
    transform: translate(-6%, -4%) scale(1);
    opacity: 0.48;
  }
}

@keyframes analyze-mesh-drift {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-56px, -56px);
  }
}
</style>
