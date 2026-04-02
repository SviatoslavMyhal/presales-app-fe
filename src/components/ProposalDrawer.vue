<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import { useProposalGenerator } from '@/composables/useProposalGenerator'
import type {
  IntelligenceResponse,
  SynthesisReport,
} from '@/types/presales'

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

const {
  senderName,
  companyName,
  error,
  proposal,
  copied,
  phase,
  canSubmit,
  handleGenerate,
  handleRegenerate,
  handleCopy,
} = useProposalGenerator({
  visible: () => props.visible,
  report: () => props.report,
  intelligence: () => props.intelligence,
  jobPost: () => props.jobPost,
  clientMessages: () => props.clientMessages,
  teamExpertise: () => props.teamExpertise,
  constraints: () => props.constraints,
})

function handleBackdropClick() {
  emit('close')
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

<style scoped src="@/assets/styles/proposal-drawer.css"></style>
