<script setup lang="ts">
import type { PresalesResponse } from '@/types/presales'
import { computed, ref } from 'vue'

const props = defineProps<{
  data: PresalesResponse
}>()

const activeNames = ref<string[]>([])

const analystJson = computed(() => JSON.stringify(props.data.analyst, null, 2))
const riskJson = computed(() => JSON.stringify(props.data.risk, null, 2))
const strategyJson = computed(() => JSON.stringify(props.data.strategy, null, 2))
</script>

<template>
  <div class="agent-debug">
    <p class="debug-title">
      Agent outputs (debug)
    </p>
    <el-collapse v-model="activeNames">
      <el-collapse-item
        title="Agent 1 — Analyst"
        name="analyst"
      >
        <pre class="json-block">{{ analystJson }}</pre>
      </el-collapse-item>
      <el-collapse-item
        title="Agent 2 — Risk & Discovery"
        name="risk"
      >
        <pre class="json-block">{{ riskJson }}</pre>
      </el-collapse-item>
      <el-collapse-item
        title="Agent 3 — Strategy"
        name="strategy"
      >
        <pre class="json-block">{{ strategyJson }}</pre>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.agent-debug {
  margin-top: var(--space-8);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}

.debug-title {
  margin: 0 0 var(--space-2);
  font-size: 14px;
  color: var(--text-muted);
}

.json-block {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-secondary);
}
</style>
