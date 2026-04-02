<script setup lang="ts">
import type { StepConfig } from '@/types/stepForm'

defineProps<{
  modelValue: string
  config: StepConfig
  error: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="step-body">
    <div class="step-icon-wrap">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          :d="config.icon"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="step-meta">
      <span
        v-if="config.optional"
        class="badge-optional"
      >Optional</span>
      <h2 class="step-title">
        {{ config.title }}
      </h2>
      <p class="step-desc">
        {{ config.description }}
      </p>
    </div>
    <el-input
      type="textarea"
      :model-value="modelValue"
      :placeholder="config.placeholder"
      :autosize="{ minRows: config.minRows, maxRows: 16 }"
      :class="{ 'has-error': error }"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div class="step-footer-meta">
      <span
        v-if="error"
        class="step-error"
      >{{ error }}</span>
      <span
        v-else-if="config.hint"
        class="step-hint"
      >{{ config.hint }}</span>
      <span class="char-count">{{ (modelValue || '').length }} chars</span>
    </div>
  </div>
</template>

<style scoped>
.step-body {
  min-height: 0;
}

.step-icon-wrap {
  width: 44px;
  height: 44px;
  background: var(--accent-subtle);
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.step-icon-wrap svg {
  width: 20px;
  height: 20px;
  color: var(--accent-primary);
}

.badge-optional {
  display: inline-block;
  padding: 2px var(--space-2);
  background: rgba(0, 230, 118, 0.06);
  border: 1px solid var(--accent-border);
  border-radius: 20px;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--accent-muted);
  font-weight: 500;
  margin-bottom: var(--space-2);
}

.step-meta {
  margin-bottom: var(--space-4);
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-2);
}

.step-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

.step-footer-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-4);
  min-height: var(--space-6);
}

.step-error {
  font-size: 13px;
  color: var(--severity-high);
  flex: 1;
}

.step-hint {
  font-size: 12px;
  color: var(--text-muted);
  flex: 1;
  line-height: 1.4;
}

.char-count {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}

:deep(.el-textarea__inner) {
  background: var(--bg-elevated) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-primary) !important;
  font-size: 14px !important;
  line-height: 1.7 !important;
  padding: var(--space-4) !important;
  resize: none !important;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: var(--accent-primary) !important;
  box-shadow: 0 0 0 3px rgba(0, 230, 118, 0.1) !important;
  outline: none !important;
}

:deep(.has-error .el-textarea__inner) {
  border-color: var(--severity-high) !important;
}
</style>
