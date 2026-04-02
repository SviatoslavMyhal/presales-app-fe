import type { PresalesRequest } from '@/types/presales'
import type { Component } from 'vue'

export interface StepRule {
  required: boolean
  minLength?: number
  errorMessage: string
}

export interface StepConfig {
  key: keyof PresalesRequest
  component: Component
  title: string
  description: string
  placeholder: string
  icon: string
  optional: boolean
  rule: StepRule
  minRows: number
  hint?: string
}
