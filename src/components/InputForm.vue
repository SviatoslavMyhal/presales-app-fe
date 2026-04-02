<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { PresalesRequest } from '@/types/presales'
import { reactive, ref, watch } from 'vue'

const props = defineProps<{
  loading?: boolean
  modelValue?: PresalesRequest
}>()

const emit = defineEmits<{
  submit: [payload: PresalesRequest]
}>()

const formRef = ref<FormInstance>()

const form = reactive<PresalesRequest>({
  job_post: '',
  client_messages: '',
  team_expertise: '',
  constraints: ''
})

watch(
  () => props.modelValue,
  (v) => {
    if (!v) {
      return
    }
    form.job_post = v.job_post ?? ''
    form.client_messages = v.client_messages ?? ''
    form.team_expertise = v.team_expertise ?? ''
    form.constraints = v.constraints ?? ''
  },
  { immediate: true, deep: true }
)

const rules: FormRules = {
  job_post: [
    {
      required: true,
      message: 'Job post / project description is required',
      trigger: 'blur'
    }
  ]
}

function buildPayload(): PresalesRequest {
  const job_post = form.job_post.trim()
  const payload: PresalesRequest = { job_post }

  const client_messages = form.client_messages?.trim()
  if (client_messages) {
    payload.client_messages = client_messages
  }

  const team_expertise = form.team_expertise?.trim()
  if (team_expertise) {
    payload.team_expertise = team_expertise
  }

  const constraints = form.constraints?.trim()
  if (constraints) {
    payload.constraints = constraints
  }

  return payload
}

async function handleSubmit() {
  if (!formRef.value) {
    return
  }
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }
  emit('submit', buildPayload())
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    class="input-form"
    @submit.prevent="handleSubmit"
  >
    <el-form-item
      label="Job post / Project description"
      prop="job_post"
    >
      <el-input
        v-model="form.job_post"
        type="textarea"
        :autosize="{ minRows: 6, maxRows: 14 }"
        placeholder="Paste the job post or project description"
      />
    </el-form-item>

    <el-form-item prop="client_messages">
      <template #label>
        <span>Client messages</span>
        <span class="optional-badge">(optional)</span>
      </template>
      <el-input
        v-model="form.client_messages"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 12 }"
        placeholder="Emails, Slack, meeting notes…"
      />
    </el-form-item>

    <el-form-item prop="team_expertise">
      <template #label>
        <span>Team expertise / Tech stack</span>
        <span class="optional-badge">(optional)</span>
      </template>
      <el-input
        v-model="form.team_expertise"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 12 }"
        placeholder="Relevant skills, stack, certifications…"
      />
    </el-form-item>

    <el-form-item prop="constraints">
      <template #label>
        <span>Constraints</span>
        <span class="optional-badge">(optional)</span>
      </template>
      <el-input
        v-model="form.constraints"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 10 }"
        placeholder="budget, timeline, timezone, engagement model…"
      />
    </el-form-item>

    <el-form-item class="submit-row">
      <el-button
        type="primary"
        native-type="submit"
        class="submit-btn"
        :loading="loading"
        :disabled="loading"
      >
        <template #loading>
          <BrandLoader size="xs" />
        </template>
        Analyze
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.input-form {
  width: 100%;
}

.optional-badge {
  margin-left: 6px;
  font-size: 12px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
}

.submit-row {
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
}

.submit-btn :deep(.brand-loader) {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
}
</style>
