<script setup lang="ts">
import AgentProgress from '@/components/AgentProgress.vue'
import ReportView from '@/components/ReportView.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import StepForm from '@/components/StepForm.vue'
import { analyzePresales } from '@/api/presales'
import type { PresalesAnalyzeResult } from '@/api/backend-types'
import type { PresalesRequest, PresalesResponse } from '@/types/presales'
import { formatApiError } from '@/utils/api-error'
import {
  getPresalesPipelineFailureMessage,
  isPresalesPipelineFailed,
} from '@/utils/presalesPipeline'
import { ElMessage } from 'element-plus'
import type { Component } from 'vue'
import { computed, nextTick, ref, shallowRef } from 'vue'

type Phase = 'splash' | 'form' | 'loading' | 'report'

const phase = ref<Phase>('splash')
const currentComponent = shallowRef<Component>(SplashScreen)
const result = ref<PresalesAnalyzeResult | null>(null)
const error = ref<string | null>(null)
const submittedPayload = ref<PresalesRequest | null>(null)

const componentProps = computed(() => {
  const r = result.value
  switch (phase.value) {
    case 'splash':
      return {}
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

function goToForm() {
  phase.value = 'form'
  currentComponent.value = StepForm
}

function goToSplash() {
  phase.value = 'splash'
  currentComponent.value = SplashScreen
}

async function handleFormSubmit(payload: PresalesRequest) {
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
      goToSplash()
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

function handleReset() {
  result.value = null
  phase.value = 'form'
  currentComponent.value = StepForm
}
</script>

<template>
  <div class="home-view-root">
    <KeepAlive include="StepForm">
      <component
        :is="currentComponent"
        v-bind="componentProps"
        @start="goToForm"
        @submit="handleFormSubmit"
        @reset="handleReset"
        @back="goToSplash"
      />
    </KeepAlive>
  </div>
</template>

<style scoped>
.home-view-root {
  min-height: 100%;
  min-height: min(100vh, 100dvh);
  background: var(--bg-base);
}
</style>
