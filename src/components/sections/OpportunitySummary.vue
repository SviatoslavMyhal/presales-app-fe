<script setup lang="ts">
defineProps<{
  summary: string
}>()
</script>

<template>
  <article class="opportunity-article">
    <h3 class="sr-only">
      Opportunity summary
    </h3>
    <div
      class="opportunity-article__frame"
      aria-hidden="true"
    />
    <p
      v-if="summary"
      class="opportunity-article__body"
    >
      {{ summary }}
    </p>
  </article>
</template>

<style scoped>
.opportunity-article {
  position: relative;
  padding: var(--space-2);
}

.opportunity-article__frame {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);
  background: linear-gradient(
    135deg,
    var(--accent-subtle) 0%,
    transparent 55%
  );
  pointer-events: none;
  opacity: 0.9;
}

.opportunity-article__body {
  position: relative;
  margin: 0;
  padding: var(--space-4) var(--space-5);
  line-height: 1.75;
  font-size: 15px;
  color: var(--text-primary);
}

.opportunity-article__body::first-letter {
  float: left;
  margin: 0.08em 0.12em 0 0;
  font-size: 2.75rem;
  line-height: 0.85;
  font-weight: 700;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: Georgia, 'Times New Roman', serif;
}

@media (max-width: 600px) {
  .opportunity-article__body::first-letter {
    font-size: 2.25rem;
  }
}
</style>
