import type { CallIntent, OpportunityMeta, OpportunityStage } from '@/domain/opportunity'
import { defaultOpportunityMeta } from '@/domain/opportunity'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'presales-opportunity-meta-v1'

function loadRaw(): Record<string, OpportunityMeta> {
  if (typeof localStorage === 'undefined') {
    return {}
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as Record<string, Partial<OpportunityMeta>>
    const out: Record<string, OpportunityMeta> = {}
    for (const [id, v] of Object.entries(parsed)) {
      out[id] = { ...defaultOpportunityMeta(), ...v }
    }
    return out
  }
  catch {
    return {}
  }
}

export const useOpportunityMetaStore = defineStore('opportunity-meta', () => {
  const byId = ref<Record<string, OpportunityMeta>>(loadRaw())

  watch(
    byId,
    (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      }
      catch {
        /* ignore quota */
      }
    },
    { deep: true },
  )

  function getMeta(id: string): OpportunityMeta {
    return byId.value[id] ?? defaultOpportunityMeta()
  }

  function patchMeta(id: string, patch: Partial<OpportunityMeta>) {
    const prev = byId.value[id] ?? defaultOpportunityMeta()
    byId.value = {
      ...byId.value,
      [id]: { ...prev, ...patch },
    }
  }

  function setStage(id: string, stage: OpportunityStage) {
    patchMeta(id, { stage })
  }

  function setCallAt(id: string, callAt: string | null) {
    patchMeta(id, { callAt })
  }

  function setIntent(id: string, intent: CallIntent | null) {
    patchMeta(id, { intent })
  }

  function setPerformScratchpad(id: string, performScratchpad: string) {
    patchMeta(id, { performScratchpad })
  }

  function setDebriefNotes(id: string, debriefNotes: string) {
    patchMeta(id, { debriefNotes })
  }

  function touchOpened(id: string) {
    patchMeta(id, { lastOpenedAt: new Date().toISOString() })
  }

  const metaVersion = computed(() => JSON.stringify(byId.value))

  return {
    byId,
    metaVersion,
    getMeta,
    patchMeta,
    setStage,
    setCallAt,
    setIntent,
    setPerformScratchpad,
    setDebriefNotes,
    touchOpened,
  }
})
