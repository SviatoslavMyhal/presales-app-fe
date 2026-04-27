import type { ReportListItem } from '@/api/backend-types'
import {
  isDueSoon,
  isStale,
  needsMoreInput,
} from '@/domain/opportunity'
import { useOpportunityMetaStore } from '@/stores/opportunity-meta.store'
import { computed, type Ref } from 'vue'

export function useOpportunityBoard(reports: Ref<ReportListItem[]>) {
  const metaStore = useOpportunityMetaStore()

  const enriched = computed(() => {
    void metaStore.metaVersion
    return reports.value.map((row) => {
      const meta = metaStore.getMeta(row.id)
      return {
        row,
        meta,
        stale: isStale(row.updated_at, meta.stage),
        dueSoon: isDueSoon(meta.callAt, meta.stage),
        needsTitle: needsMoreInput(row.title),
      }
    })
  })

  const dueSoon = computed(() =>
    enriched.value.filter(e => e.dueSoon),
  )

  const stale = computed(() =>
    enriched.value.filter(e => e.stale && !e.dueSoon),
  )

  const needsInput = computed(() =>
    enriched.value.filter(e => e.needsTitle),
  )

  return {
    enriched,
    dueSoon,
    stale,
    needsInput,
  }
}
