<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { generateProposal } from '@/api/presales.api'
import type {
  IntelligenceResponse,
  ProposalData,
  SynthesisReport,
} from '@/types/presales'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  report: SynthesisReport
  intelligence: IntelligenceResponse
  jobPost: string
  clientMessages?: string
  teamExpertise?: string
  constraints?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const senderName = ref('')
const companyName = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const proposal = ref<ProposalData | null>(null)
const copied = ref(false)
const phase = ref<'form' | 'generating' | 'result'>('form')

watch(
  () => props.visible,
  (val) => {
    if (val) {
      phase.value = 'form'
      error.value = null
    }
  },
)

const canSubmit = computed(() => !loading.value)

async function handleGenerate () {
  if (!canSubmit.value) {
    return
  }
  loading.value = true
  error.value = null
  phase.value = 'generating'

  try {
    const result = await generateProposal({
      synthesis_report: props.report,
      intelligence: props.intelligence,
      job_post: props.jobPost,
      client_messages: props.clientMessages ?? '',
      team_expertise: props.teamExpertise ?? '',
      constraints: props.constraints ?? '',
      sender_name: senderName.value.trim(),
      company_name: companyName.value.trim(),
    })

    if (result.status === 'error' || !result.data) {
      throw new Error(result.error ?? 'Generation failed')
    }

    proposal.value = result.data
    phase.value = 'result'
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Generation failed'
    error.value = msg
    phase.value = 'form'
  } finally {
    loading.value = false
  }
}

function handleRegenerate () {
  proposal.value = null
  phase.value = 'form'
}

function handleBackdropClick () {
  emit('close')
}

async function handleCopy () {
  if (!proposal.value) {
    return
  }
  const text = buildPlainText(proposal.value)
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2500)
}

function buildPlainText (p: ProposalData): string {
  const lines: string[] = [
    `Subject: ${p.subject}`,
    '',
    p.greeting,
    '',
    ...p.sections.flatMap(s => [`${s.title}`, s.content, '']),
    p.closing,
    '',
    p.signature,
  ]
  return lines.join('\n')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div
        v-if="props.visible"
        class="drawer-backdrop"
        @click="handleBackdropClick"
      />
    </Transition>

    <Transition name="drawer-slide">
      <div
        v-if="props.visible"
        class="proposal-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-drawer-title"
        @click.stop
      >
        <div class="drawer-header">
          <div class="drawer-header-left">
            <div class="drawer-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div>
              <h2
                id="proposal-drawer-title"
                class="drawer-title"
              >
                Proposal Generator
              </h2>
              <p class="drawer-subtitle">
                AI-drafted, ready to send
              </p>
            </div>
          </div>
          <button
            type="button"
            class="drawer-close"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <Transition
          name="phase-fade"
          mode="out-in"
        >
          <div
            v-if="phase === 'form'"
            key="form"
            class="drawer-body"
          >
            <p class="drawer-intro">
              Optionally add your name and company — the AI will personalise the proposal.
            </p>
            <div class="drawer-fields">
              <div class="field-group">
                <label class="field-label">Your name <span class="field-optional">(optional)</span></label>
                <input
                  v-model="senderName"
                  class="drawer-input"
                  placeholder="e.g. Alex"
                  @keydown.enter="handleGenerate"
                >
              </div>
              <div class="field-group">
                <label class="field-label">Company / Agency <span class="field-optional">(optional)</span></label>
                <input
                  v-model="companyName"
                  class="drawer-input"
                  placeholder="e.g. Devstack Agency"
                  @keydown.enter="handleGenerate"
                >
              </div>
            </div>
            <div
              v-if="error"
              class="drawer-error"
            >
              {{ error }}
            </div>
            <button
              type="button"
              class="btn-generate"
              :disabled="!canSubmit"
              @click="handleGenerate"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              Generate Proposal Draft
            </button>
          </div>

          <div
            v-else-if="phase === 'generating'"
            key="generating"
            class="drawer-body drawer-generating"
          >
            <div class="generating-orb">
              <BrandLoader size="lg" />
            </div>
            <p class="generating-label">
              Drafting your proposal...
            </p>
            <p class="generating-sub">
              Personalising tone and content to this client
            </p>
          </div>

          <div
            v-else-if="phase === 'result' && proposal"
            key="result"
            class="drawer-body drawer-result"
          >
            <div class="proposal-meta-bar">
              <span class="meta-pill">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="meta-icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ proposal.meta.estimated_read_time_seconds }}s read
              </span>
              <span class="meta-pill">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="meta-icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
                {{ proposal.meta.word_count }} words
              </span>
              <span class="meta-pill meta-tone">{{ proposal.meta.tone }}</span>
            </div>

            <div class="proposal-card">
              <div class="proposal-subject">
                <span class="proposal-subject-label">Subject</span>
                <span class="proposal-subject-text">{{ proposal.subject }}</span>
              </div>

              <div class="proposal-body-text">
                <p class="proposal-greeting">
                  {{ proposal.greeting }}
                </p>

                <div
                  v-for="(section, si) in proposal.sections"
                  :key="si + '-' + section.title"
                  class="proposal-section"
                >
                  <h4 class="proposal-section-title">
                    {{ section.title }}
                  </h4>
                  <p class="proposal-section-content">
                    {{ section.content }}
                  </p>
                </div>

                <p class="proposal-closing">
                  {{ proposal.closing }}
                </p>
                <p class="proposal-signature">
                  {{ proposal.signature }}
                </p>
              </div>
            </div>

            <div class="proposal-actions">
              <button
                type="button"
                class="btn-copy"
                :class="{ copied }"
                @click="handleCopy"
              >
                <Transition
                  name="copy-icon"
                  mode="out-in"
                >
                  <svg
                    v-if="!copied"
                    key="copy"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  <svg
                    v-else
                    key="check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </Transition>
                {{ copied ? 'Copied!' : 'Copy to clipboard' }}
              </button>
              <button
                type="button"
                class="btn-regenerate"
                @click="handleRegenerate"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 300;
}

.proposal-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(520px, 100vw);
  background: var(--bg-surface);
  border-left: 1px solid var(--border-subtle);
  z-index: 301;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  flex-shrink: 0;
}

.drawer-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.drawer-icon {
  width: 40px;
  height: 40px;
  background: var(--accent-subtle);
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawer-icon svg {
  width: 20px;
  height: 20px;
  color: var(--accent-primary);
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.drawer-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.drawer-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.drawer-close:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.drawer-close svg {
  width: 16px;
  height: 16px;
}

.drawer-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.drawer-intro {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.drawer-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
}

.field-optional {
  color: var(--text-muted);
  font-weight: 400;
}

.drawer-input {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: 14px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  width: 100%;
}

.drawer-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 230, 118, 0.1);
}

.drawer-input::placeholder {
  color: var(--text-muted);
}

.drawer-error {
  font-size: 13px;
  color: var(--severity-high);
  background: rgba(255, 82, 82, 0.08);
  border: 1px solid rgba(255, 82, 82, 0.2);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}

.btn-generate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  height: 48px;
  background: var(--gradient-brand);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 20px rgba(0, 230, 118, 0.25);
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(0, 230, 118, 0.35);
}

.btn-generate:active:not(:disabled) {
  transform: translateY(0);
}

.btn-generate:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-generate svg {
  width: 18px;
  height: 18px;
}

/* Result phase: scroll only the proposal body, keep meta + subject + actions visible */
.drawer-body.drawer-result {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.drawer-result .proposal-meta-bar {
  flex-shrink: 0;
}

.drawer-result .proposal-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-result .proposal-actions {
  flex-shrink: 0;
}

.drawer-generating {
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.generating-orb {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
}

.generating-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.generating-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.proposal-meta-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
}

.meta-tone {
  background: var(--accent-subtle);
  border-color: var(--accent-border);
  color: var(--accent-primary);
  text-transform: capitalize;
}

.meta-icon {
  width: 12px;
  height: 12px;
}

.proposal-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.proposal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-brand);
  opacity: 0.3;
}

.proposal-subject {
  flex-shrink: 0;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(0, 230, 118, 0.02);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.proposal-subject-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--accent-muted);
  font-weight: 600;
}

.proposal-subject-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.proposal-body-text {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  scrollbar-gutter: stable;
}

.proposal-greeting {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 500;
}

.proposal-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.proposal-section-title {
  font-size: 10px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--accent-muted);
  font-weight: 600;
  margin: 0;
}

.proposal-section-content {
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-secondary);
  margin: 0;
}

.proposal-closing {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

.proposal-signature {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: pre-line;
  margin: 0;
}

.proposal-actions {
  display: flex;
  gap: var(--space-3);
}

.btn-copy {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: var(--gradient-brand);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 16px rgba(0, 230, 118, 0.2);
}

.btn-copy.copied {
  background: linear-gradient(135deg, var(--accent-secondary), var(--accent-muted));
}

.btn-copy svg {
  width: 16px;
  height: 16px;
}

.btn-copy:hover {
  transform: translateY(-1px);
}

.btn-regenerate {
  height: 44px;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-regenerate:hover {
  color: var(--text-primary);
  border-color: var(--accent-border);
}

.btn-regenerate svg {
  width: 15px;
  height: 15px;
}

.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity var(--transition-base);
}

.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform var(--transition-slow);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.phase-fade-enter-active,
.phase-fade-leave-active {
  transition: opacity 200ms ease;
}

.phase-fade-enter-from,
.phase-fade-leave-to {
  opacity: 0;
}

.copy-icon-enter-active,
.copy-icon-leave-active {
  transition: all 150ms ease;
}

.copy-icon-enter-from {
  opacity: 0;
  transform: scale(0.7);
}

.copy-icon-leave-to {
  opacity: 0;
  transform: scale(1.2);
}
</style>
