<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    variant?: 'live' | 'saved'
  }>(),
  { variant: 'live' },
)
</script>

<template>
  <section
    id="context"
    class="report-section report-section--brief"
    data-section="context"
    aria-labelledby="source-brief-heading"
  >
    <div class="section-header">
      <div class="source-brief__title-block">
        <p class="source-brief__kicker">
          Input you analyzed
        </p>
        <h2
          id="source-brief-heading"
          class="source-brief__title"
        >
          {{ variant === 'saved' ? 'Original brief' : 'Your brief' }}
        </h2>
      </div>
      <span
        class="source-brief__badge"
        aria-hidden="true"
      >Source</span>
    </div>
    <div class="source-brief__body">
      <div class="source-brief__inner">
        <p class="source-brief__text">
          {{ text }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/report-source-brief.css"></style>
