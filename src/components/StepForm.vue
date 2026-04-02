<script setup lang="ts">
import { stepConfig } from '@/config/stepConfig'
import { useStepForm } from '@/composables/useStepForm'
import type { StepConfig } from '@/types/stepForm'
import type { PresalesRequest, PresalesResponse, SynthesisReport } from '@/types/presales'
import { computed, watch } from 'vue'

defineOptions({
  name: 'StepForm'
})

const props = defineProps<{
  result?: PresalesResponse | null
  error?: string | null
  initialPayload?: PresalesRequest | null
  report?: SynthesisReport
}>()

const emit = defineEmits<{
  submit: [payload: PresalesRequest]
  back: []
}>()

const {
  formData,
  currentStep,
  errors,
  totalSteps,
  isLastStep,
  nextStep,
  prevStep,
  getPayload,
  resetForm
} = useStepForm()

const activeConfig = computed((): StepConfig => {
  const cfg = stepConfig[currentStep.value] ?? stepConfig[0]
  if (!cfg) {
    throw new Error('stepConfig is empty')
  }
  return cfg
})

watch(
  () => props.initialPayload,
  (v) => {
    if (!v) {
      resetForm()
      return
    }
    formData.value.job_post = v.job_post ?? ''
    formData.value.client_messages = v.client_messages ?? ''
    formData.value.team_expertise = v.team_expertise ?? ''
    formData.value.constraints = v.constraints ?? ''
  },
  { immediate: true, deep: true }
)

function onFieldUpdate(v: string) {
  const key = activeConfig.value.key
  formData.value = { ...formData.value, [key]: v }
}

function handleBack() {
  if (currentStep.value === 0) {
    emit('back')
    return
  }
  prevStep()
}

function handleContinue() {
  const atEnd = isLastStep.value
  if (!nextStep()) {
    return
  }
  if (atEnd) {
    emit('submit', getPayload())
  }
}

function segmentClass(index: number): string[] {
  const classes: string[] = ['segment']
  if (index < currentStep.value) {
    classes.push('segment--done')
  } else if (index === currentStep.value) {
    classes.push('segment--active')
  } else {
    classes.push('segment--todo')
  }
  return classes
}

function labelClass(index: number): string[] {
  const classes: string[] = ['segment-label']
  if (index === currentStep.value) {
    classes.push('segment-label--active')
  }
  return classes
}
</script>

<template>
  <div class="step-form">
    <div class="stepper-mobile">
      Step {{ currentStep + 1 }} of 4
    </div>

    <div
      class="stepper-desktop"
      aria-hidden="true"
    >
      <div class="stepper-segments">
        <div
          v-for="(step, index) in stepConfig"
          :key="step.key"
          class="segment-col"
        >
          <div :class="segmentClass(index)" />
          <span :class="labelClass(index)">{{ step.title }}</span>
        </div>
      </div>
    </div>

    <div class="form-card">
      <el-alert
        v-if="error"
        type="error"
        :closable="false"
        show-icon
        class="form-alert"
      >
        {{ error }}
      </el-alert>

      <Transition
        name="step"
        mode="out-in"
      >
        <component
          :is="activeConfig.component"
          :key="activeConfig.key"
          :model-value="(formData[activeConfig.key] as string) ?? ''"
          :config="activeConfig"
          :error="errors[currentStep] ?? ''"
          @update:model-value="onFieldUpdate"
        />
      </Transition>

      <div class="nav-row">
        <button
          type="button"
          class="btn-ghost"
          @click="handleBack"
        >
          Back
        </button>
        <button
          v-if="currentStep < totalSteps - 1"
          type="button"
          class="btn-primary"
          @click="handleContinue"
        >
          Continue
        </button>
        <button
          v-else
          type="button"
          class="btn-primary btn-primary--analyze"
          @click="handleContinue"
        >
          <span>Analyze</span>
          <svg
            class="btn-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-form {
  min-height: 100vh;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stepper-mobile {
  display: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  text-align: center;
}

.stepper-desktop {
  width: 100%;
  max-width: 640px;
  margin-bottom: var(--space-8);
}

.stepper-segments {
  display: flex;
  gap: var(--space-1);
  width: 100%;
  align-items: flex-start;
}

.segment-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.segment {
  height: 3px;
  border-radius: 2px;
  background: var(--bg-elevated);
  transition:
    background var(--transition-base),
    box-shadow var(--transition-base);
}

.segment--done {
  background: var(--gradient-brand);
}

.segment--active {
  background: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-primary);
  animation: segment-pulse 2s ease-in-out infinite;
}

.segment--todo {
  background: var(--bg-elevated);
}

@keyframes segment-pulse {
  0%,
  100% {
    box-shadow: 0 0 8px var(--accent-primary);
  }
  50% {
    box-shadow: 0 0 14px var(--accent-primary);
  }
}

.segment-label {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.3;
  text-align: center;
  display: block;
}

.segment-label--active {
  color: var(--text-primary);
  font-weight: 600;
}

.form-card {
  width: 100%;
  max-width: 640px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-8) var(--space-8) var(--space-6);
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-brand);
  opacity: 0.4;
}

.form-alert {
  margin-bottom: var(--space-6);
}

.step-enter-active,
.step-leave-active {
  transition: all var(--transition-base);
}

.step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-8);
  gap: var(--space-4);
}

.btn-ghost,
.btn-primary {
  cursor: pointer;
  height: 44px;
  padding: 0 var(--space-6);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    filter var(--transition-fast),
    box-shadow var(--transition-fast);
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--accent-subtle);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: none;
  background: var(--gradient-brand);
  color: var(--text-inverse);
}

.btn-primary:hover {
  filter: brightness(1.08);
}

.btn-primary--analyze {
  box-shadow: 0 4px 20px rgba(0, 230, 118, 0.25);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .stepper-mobile {
    display: block;
  }

  .stepper-desktop {
    display: none;
  }

  .form-card {
    padding: var(--space-6);
  }
}
</style>
