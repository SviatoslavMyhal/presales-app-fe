import { stepConfig } from '@/config/stepConfig'
import type { PresalesRequest } from '@/types/presales'
import { computed, ref } from 'vue'

export type { StepConfig, StepRule } from '@/types/stepForm'

export function useStepForm() {
  const formData = ref<PresalesRequest>({
    job_post: '',
    client_messages: '',
    team_expertise: '',
    constraints: '',
  })

  const currentStep = ref(0)
  const touched = ref<boolean[]>([false, false, false, false])
  const errors = ref<string[]>(['', '', '', ''])

  const totalSteps = 4

  function validateStep(index: number): boolean {
    const step = stepConfig[index]
    if (!step) {
      return false
    }
    const value = (formData.value[step.key]!) ?? ''
    if (!step.rule.required) {
      errors.value[index] = ''
      return true
    }
    const minLen = step.rule.minLength ?? 1
    if (!value || value.trim().length < minLen) {
      errors.value[index] = step.rule.errorMessage
      return false
    }
    errors.value[index] = ''
    return true
  }

  function nextStep(): boolean {
    touched.value[currentStep.value] = true
    if (!validateStep(currentStep.value)) {
      return false
    }
    if (currentStep.value < totalSteps - 1) {
      currentStep.value++
      return true
    }
    return true
  }

  function prevStep() {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const isLastStep = computed(() => currentStep.value === totalSteps - 1)
  const progress = computed(() => (currentStep.value / (totalSteps - 1)) * 100)

  function getPayload(): PresalesRequest {
    const d = formData.value
    const job_post = d.job_post.trim()
    const out: PresalesRequest = { job_post }
    const cm = d.client_messages?.trim()
    if (cm) {
      out.client_messages = cm
    }
    const te = d.team_expertise?.trim()
    if (te) {
      out.team_expertise = te
    }
    const c = d.constraints?.trim()
    if (c) {
      out.constraints = c
    }
    return out
  }

  function resetForm(): void {
    formData.value = {
      job_post: '',
      client_messages: '',
      team_expertise: '',
      constraints: '',
    }
    currentStep.value = 0
    touched.value = [false, false, false, false]
    errors.value = ['', '', '', '']
  }

  return {
    formData,
    currentStep,
    touched,
    errors,
    totalSteps,
    isLastStep,
    progress,
    nextStep,
    prevStep,
    validateStep,
    getPayload,
    resetForm,
  }
}
