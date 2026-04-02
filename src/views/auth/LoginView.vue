<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthCard from '@/components/auth/AuthCard.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'
import { formatApiError } from '@/utils/api-error'

import { authEmailPasswordRules } from './authFormRules'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref<string | null>(null)

function resolveAfterAuth () {
  const raw = route.query.redirect
  if (typeof raw === 'string' && raw.startsWith('/')) {
    return raw
  }
  return { name: routeNames.reports }
}

onMounted(() => {
  if (auth.isAuthenticated) {
    void router.replace(resolveAfterAuth())
  }
})

const rules: FormRules = authEmailPasswordRules

async function onSubmit () {
  error.value = null
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await auth.login(form.email.trim(), form.password)
    void router.replace(resolveAfterAuth())
  } catch (e) {
    error.value = formatApiError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard>
    <template #header>
      <p class="auth-kicker">
        Welcome back
      </p>
      <h1 class="auth-heading">
        Sign in
      </h1>
      <p class="auth-lede">
        New here?
        <RouterLink
          :to="{ name: routeNames.signup }"
          class="auth-link"
        >
          Create an account
        </RouterLink>
      </p>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="auth-form"
      require-asterisk-position="right"
      @submit.prevent="onSubmit"
    >
      <el-form-item
        label="Email"
        prop="email"
      >
        <el-input
          v-model="form.email"
          type="email"
          autocomplete="email"
          size="large"
          class="auth-input"
        />
      </el-form-item>
      <el-form-item
        label="Password"
        prop="password"
      >
        <el-input
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          show-password
          size="large"
          class="auth-input"
        />
      </el-form-item>
      <div
        v-if="error"
        class="auth-error"
        role="alert"
      >
        {{ error }}
      </div>
      <button
        type="submit"
        class="auth-submit"
        :disabled="loading"
      >
        <span class="auth-submit-inner">
          <BrandLoader
            v-if="loading"
            size="xs"
          />
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </span>
      </button>
    </el-form>
  </AuthCard>
</template>
