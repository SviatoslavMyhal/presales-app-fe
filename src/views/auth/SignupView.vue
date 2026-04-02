<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthCard from '@/components/auth/AuthCard.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'
import { formatApiError } from '@/utils/api-error'

import { authEmailPasswordRules } from './authFormRules'

const auth = useAuthStore()
const router = useRouter()

const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref<string | null>(null)
/** Backend did not return a session — user must confirm email before signing in */
const checkEmailSent = ref(false)

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
    await auth.signup(form.email.trim(), form.password)
    if (auth.isAuthenticated) {
      router.replace({ name: routeNames.home })
    } else {
      checkEmailSent.value = true
    }
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
        Join the workspace
      </p>
      <h1 class="auth-heading">
        Create account
      </h1>
      <p class="auth-lede">
        Already have an account?
        <RouterLink
          :to="{ name: routeNames.login }"
          class="auth-link"
        >
          Sign in
        </RouterLink>
      </p>
    </template>

    <div
      v-if="checkEmailSent"
      class="auth-check-email"
      role="status"
    >
      <p class="auth-check-email-title">
        Check your email
      </p>
      <p class="auth-check-email-text">
        We sent a message to your email address. Open the link in that message to confirm your registration.
      </p>
      <RouterLink
        :to="{ name: routeNames.login }"
        class="auth-link auth-check-email-link"
      >
        Go to sign in
      </RouterLink>
    </div>

    <el-form
      v-else
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
          autocomplete="new-password"
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
          {{ loading ? 'Creating…' : 'Create account' }}
        </span>
      </button>
    </el-form>
  </AuthCard>
</template>
