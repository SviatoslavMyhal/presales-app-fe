<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthGlowShell from '@/components/auth/AuthGlowShell.vue'
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'
import { formatApiError } from '@/utils/api-error'

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

onMounted(() => {
  if (auth.isAuthenticated) {
    const raw = route.query.redirect
    const redirect = typeof raw === 'string' && raw.startsWith('/') ? raw : '/'
    void router.replace(redirect)
  }
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 8, message: 'At least 8 characters', trigger: 'blur' }
  ]
}

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
    const raw = route.query.redirect
    const redirect = typeof raw === 'string' && raw.startsWith('/') ? raw : '/'
    router.replace(redirect)
  } catch (e) {
    error.value = formatApiError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthGlowShell>
    <div class="auth-card">
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
    </div>
  </AuthGlowShell>
</template>

<style scoped>
.auth-card {
  padding: 18px;
  border-radius: var(--radius-xl);
  background: linear-gradient(
    145deg,
    rgba(22, 29, 23, 0.92) 0%,
    rgba(12, 16, 14, 0.88) 100%
  );
  border: 1px solid rgba(0, 230, 118, 0.18);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.06) inset,
    0 24px 64px rgba(0, 0, 0, 0.45),
    0 0 80px rgba(0, 230, 118, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.auth-kicker {
  margin: 0 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent-primary);
  opacity: 0.9;
}

.auth-heading {
  margin: 0 0 var(--space-3);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-lede {
  margin: 0 0 var(--space-2);
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.auth-link {
  color: var(--accent-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-form {
  margin-top: var(--space-6);
}

.auth-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: var(--space-5);
}

.auth-form :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.35) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: 0 0 0 1px rgba(0, 230, 118, 0.15) !important;
  transition: box-shadow var(--transition-fast) !important;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0, 230, 118, 0.28) !important;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--accent-primary), 0 0 24px rgba(0, 230, 118, 0.15) !important;
}

.auth-form :deep(.el-input__inner) {
  color: var(--text-primary);
  font-size: 15px;
}

.auth-error {
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  font-size: 13px;
  line-height: 1.45;
  color: #ff8a80;
  background: rgba(255, 82, 82, 0.08);
  border: 1px solid rgba(255, 82, 82, 0.25);
  border-radius: var(--radius-md);
}

.auth-submit-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.auth-submit-inner :deep(.brand-loader) {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.45));
}

.auth-submit {
  width: 100%;
  margin-top: var(--space-2);
  height: 50px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--gradient-brand);
  color: var(--text-inverse);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.25),
    0 12px 40px rgba(0, 230, 118, 0.15);
  transition:
    filter var(--transition-fast),
    transform var(--transition-fast),
    opacity var(--transition-fast);
}

.auth-submit:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.auth-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.auth-submit:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
}
</style>
