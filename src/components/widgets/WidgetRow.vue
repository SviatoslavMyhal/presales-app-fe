<script setup lang="ts">
import ClientTypeWidget from '@/components/widgets/ClientTypeWidget.vue'
import ConfidenceWidget from '@/components/widgets/ConfidenceWidget.vue'
import SuggestedPitchWidget from '@/components/widgets/SuggestedPitchWidget.vue'
import type { IntelligenceData } from '@/types/presales'

defineProps<{
  intelligence: IntelligenceData
}>()
</script>

<template>
  <div class="widget-layout">
    <div class="widget-layout__top">
      <div class="widget-layout__top-left">
        <ConfidenceWidget
          :data="intelligence.confidence"
          section="score"
        />
        <ClientTypeWidget
          :data="intelligence.client_type"
          section="profile"
        />
      </div>
      <div class="widget-layout__top-right">
        <SuggestedPitchWidget
          :data="intelligence.suggested_pitch"
          section="opening"
        />
      </div>
    </div>
    <div class="widget-layout__bottom">
      <ConfidenceWidget
        :data="intelligence.confidence"
        section="reasons"
      />
      <ClientTypeWidget
        :data="intelligence.client_type"
        section="signals"
      />
      <SuggestedPitchWidget
        :data="intelligence.suggested_pitch"
        section="rest"
      />
    </div>
  </div>
</template>

<style scoped>
.widget-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
}

.widget-layout__top {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: var(--space-6);
  align-items: stretch;
}

.widget-layout__top-left {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  min-width: 0;
}

.widget-layout__top-right {
  min-width: 0;
}

.widget-layout__bottom {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  align-items: stretch;
}

@media (max-width: 1100px) {
  .widget-layout__top {
    grid-template-columns: 1fr;
  }

  .widget-layout__top-left {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .widget-layout__top-left {
    grid-template-columns: 1fr;
  }

  .widget-layout__bottom {
    grid-template-columns: 1fr;
  }
}
</style>
