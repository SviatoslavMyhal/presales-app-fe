<script setup lang="ts">
import BrandLoader from '@/components/loaders/BrandLoader.vue'
import type { ReportListItem } from '@/api/backend-types'
import { useId } from 'vue'

const waveGradientId = `saved-card-wave-${useId().replace(/:/g, '')}`

defineProps<{
  row: ReportListItem
  /** `formatDate(row.created_at)` from parent */
  formattedDate: string
  deletingId: string | null
}>()

const emit = defineEmits<{
  open: [id: string]
  delete: [row: ReportListItem, e: MouseEvent]
}>()
</script>

<template>
  <div class="saved-report-card">
    <button
      type="button"
      class="saved-report-card__open"
      :class="{ 'saved-report-card__open--busy': deletingId === row.id }"
      :disabled="deletingId === row.id"
      @click="emit('open', row.id)"
    >
      <span
        class="saved-report-card__rim"
        aria-hidden="true"
      />
      <span
        class="saved-report-card__aurora"
        aria-hidden="true"
      />
      <span
        class="saved-report-card__sheen"
        aria-hidden="true"
      />

      <div class="saved-report-card__body">
        <div class="saved-report-card__top">
          <span class="saved-report-card__eyebrow">Workspace</span>
          <h2 class="saved-report-card__title">
            {{ row.title || 'Untitled report' }}
          </h2>
          <p class="saved-report-card__meta">
            <svg
              class="saved-report-card__clock"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <time
              :datetime="row.created_at"
            >{{ formattedDate }}</time>
          </p>
        </div>

        <div
          class="saved-report-card__canvas"
          aria-hidden="true"
        >
          <svg
            class="saved-report-card__waves"
            viewBox="0 0 400 48"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                :id="waveGradientId"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stop-color="rgba(0, 230, 118, 0)"
                />
                <stop
                  offset="35%"
                  stop-color="rgba(0, 230, 118, 0.35)"
                />
                <stop
                  offset="70%"
                  stop-color="rgba(0, 137, 123, 0.25)"
                />
                <stop
                  offset="100%"
                  stop-color="rgba(0, 230, 118, 0)"
                />
              </linearGradient>
            </defs>
            <path
              fill="none"
              :stroke="`url(#${waveGradientId})`"
              stroke-width="1.25"
              d="M0 28 Q100 8 200 28 T400 28"
            />
            <path
              fill="none"
              stroke="rgba(0, 230, 118, 0.12)"
              stroke-width="0.75"
              d="M0 36 Q120 22 220 36 T400 34"
            />
          </svg>
        </div>

        <div class="saved-report-card__foot">
          <span class="saved-report-card__cta">
            <span class="saved-report-card__cta-label">Open report</span>
            <span class="saved-report-card__cta-pill">
              <svg
                class="saved-report-card__cta-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.25"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </button>

    <button
      type="button"
      class="saved-report-card__delete"
      :disabled="deletingId !== null"
      :aria-label="`Delete report ${row.title || 'Untitled report'}`"
      title="Delete report"
      @click="emit('delete', row, $event)"
    >
      <span
        v-if="deletingId === row.id"
        class="saved-report-card__delete-loader"
        aria-hidden="true"
      >
        <BrandLoader size="xs" />
      </span>
      <svg
        v-else
        class="saved-report-card__delete-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.saved-report-card {
  position: relative;
  display: block;
  min-height: 196px;
}

.saved-report-card__open {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 196px;
  padding: 0;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  text-align: left;
  overflow: hidden;
  background: linear-gradient(
    155deg,
    rgba(22, 32, 26, 0.95) 0%,
    rgba(10, 14, 12, 0.98) 42%,
    rgba(16, 22, 18, 0.96) 100%
  );
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.14) inset,
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 8px 40px rgba(0, 0, 0, 0.45),
    0 32px 64px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease;
}

.saved-report-card__open--busy {
  opacity: 0.78;
  pointer-events: none;
}

.saved-report-card__rim {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(0, 230, 118, 0.55) 0%,
    rgba(0, 230, 118, 0.08) 38%,
    rgba(0, 137, 123, 0.15) 72%,
    rgba(0, 230, 118, 0.35) 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.65;
  transition: opacity 0.35s ease;
}

.saved-report-card__open:hover .saved-report-card__rim {
  opacity: 1;
}

.saved-report-card__aurora {
  position: absolute;
  top: -40%;
  right: -25%;
  width: 85%;
  height: 95%;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 230, 118, 0.16) 0%,
    rgba(0, 137, 123, 0.06) 42%,
    transparent 68%
  );
  pointer-events: none;
  transition: opacity 0.4s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.saved-report-card__open:hover .saved-report-card__aurora {
  opacity: 1.15;
  transform: translate(-4%, 2%) scale(1.05);
}

.saved-report-card__sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.07) 0%,
    transparent 42%,
    transparent 58%,
    rgba(0, 230, 118, 0.06) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.saved-report-card__open:hover .saved-report-card__sheen {
  opacity: 1;
}

.saved-report-card__open:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    0 0 0 1px rgba(0, 230, 118, 0.22) inset,
    0 12px 48px rgba(0, 0, 0, 0.5),
    0 40px 80px rgba(0, 0, 0, 0.4),
    0 0 80px rgba(0, 230, 118, 0.12);
}

.saved-report-card__open:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 4px;
}

.saved-report-card__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 196px;
  padding: 20px 22px 18px;
  padding-right: 52px;
}

.saved-report-card__top {
  flex-shrink: 0;
}

.saved-report-card__eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(0, 230, 118, 0.75);
  text-shadow: 0 0 24px rgba(0, 230, 118, 0.35);
}

.saved-report-card__title {
  margin: 0 0 10px;
  font-size: 1.1875rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.25s ease;
}

.saved-report-card__open:hover .saved-report-card__title {
  color: #f0fdf4;
}

.saved-report-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.saved-report-card__clock {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  opacity: 0.65;
  color: rgba(0, 230, 118, 0.55);
}

.saved-report-card__canvas {
  flex: 1;
  min-height: 44px;
  display: flex;
  align-items: center;
  margin: 4px 0 8px;
  opacity: 0.85;
  transition: opacity 0.35s ease;
}

.saved-report-card__open:hover .saved-report-card__canvas {
  opacity: 1;
}

.saved-report-card__waves {
  width: 100%;
  height: 40px;
}

.saved-report-card__foot {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 4px;
}

.saved-report-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.saved-report-card__cta-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--accent-primary);
  text-shadow: 0 0 28px rgba(0, 230, 118, 0.35);
}

.saved-report-card__cta-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(
    145deg,
    rgba(0, 230, 118, 0.22) 0%,
    rgba(0, 137, 123, 0.12) 100%
  );
  border: 1px solid rgba(0, 230, 118, 0.35);
  color: var(--accent-primary);
  box-shadow:
    0 0 24px rgba(0, 230, 118, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease,
    background 0.3s ease;
}

.saved-report-card__cta-arrow {
  width: 18px;
  height: 18px;
}

.saved-report-card__open:hover .saved-report-card__cta-pill {
  transform: translateX(4px);
  box-shadow:
    0 0 32px rgba(0, 230, 118, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.saved-report-card__delete {
  position: absolute;
  top: 16px;
  right: 14px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 14px;
  border: 1px solid rgba(220, 80, 80, 0.4);
  color: rgba(255, 170, 170, 0.95);
  background: linear-gradient(
    160deg,
    rgba(120, 40, 45, 0.55) 0%,
    rgba(40, 14, 16, 0.85) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.saved-report-card__delete:hover:not(:disabled) {
  color: #ffe4e4;
  border-color: rgba(255, 140, 140, 0.65);
  background: linear-gradient(
    160deg,
    rgba(180, 50, 58, 0.75) 0%,
    rgba(60, 18, 22, 0.92) 100%
  );
  box-shadow:
    0 0 32px rgba(200, 60, 70, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: scale(1.06);
}

.saved-report-card__delete:focus-visible {
  outline: 2px solid rgba(255, 160, 160, 0.9);
  outline-offset: 2px;
}

.saved-report-card__delete:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  transform: none;
}

.saved-report-card__delete-icon {
  width: 18px;
  height: 18px;
}

.saved-report-card__delete-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.saved-report-card__delete-loader :deep(.brand-loader) {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.35));
}
</style>
