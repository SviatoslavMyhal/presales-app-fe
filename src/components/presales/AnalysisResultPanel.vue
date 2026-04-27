<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: Record<string, any> | null
}>()

const sectionKeys = computed(() => {
  const r = props.result
  if (!r) return []
  return ['analyst', 'risk', 'strategy', 'synthesis'].filter(k => k in r)
})

const otherKeys = computed(() => {
  if (!props.result) return []
  const known = new Set(['analyst', 'risk', 'strategy', 'synthesis'])
  return Object.keys(props.result).filter(k => !known.has(k))
})
</script>

<template>
  <div
    v-if="result"
    class="result-panel"
  >
    <h2 class="result-title">
      Analysis result
    </h2>
    <el-collapse accordion>
      <el-collapse-item
        v-for="key in sectionKeys"
        :key="key"
        :name="key"
      >
        <template #title>
          <span class="collapse-title">{{ key }}</span>
        </template>
        <pre class="json-block">{{ JSON.stringify(result[key], null, 2) }}</pre>
      </el-collapse-item>
      <el-collapse-item
        v-for="key in otherKeys"
        :key="'o-' + key"
        :name="'o-' + key"
      >
        <template #title>
          <span class="collapse-title">{{ key }}</span>
        </template>
        <pre class="json-block">{{ JSON.stringify(result[key], null, 2) }}</pre>
      </el-collapse-item>
    </el-collapse>
    <details class="raw-details">
      <summary>Raw JSON</summary>
      <pre class="json-block json-block--full">{{ JSON.stringify(result, null, 2) }}</pre>
    </details>
  </div>
</template>

<style scoped>
.result-panel {
  margin-top: var(--space-6);
}

.result-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.collapse-title {
  text-transform: capitalize;
  font-weight: 500;
}

.json-block {
  margin: 0;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
  overflow: auto;
  max-height: 480px;
  color: var(--text-secondary);
}

.json-block--full {
  max-height: 70vh;
}

.raw-details {
  margin-top: var(--space-4);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.raw-details summary {
  cursor: pointer;
  margin-bottom: var(--space-2);
}
</style>
