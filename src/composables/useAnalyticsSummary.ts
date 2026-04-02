import { fetchAnalyticsSummary } from '@/api/analytics.api'
import type { AnalyticsSummaryResponse } from '@/api/analytics.types'
import {
  ANALYTICS_CLIENT_TYPE_LABELS,
  ANALYTICS_CLIENT_TYPE_ORDER,
  ANALYTICS_CLIENT_TYPE_STYLE_KEYS,
  type AnalyticsClientTypeKey,
} from '@/config/analyticsClientTypes'
import { formatApiError } from '@/utils/api-error'
import { fmt1, pct, shortDate } from '@/utils/analyticsFormat'
import { formatLabel, humanizeKey } from '@/utils/formatLabel'
import { computed, onMounted, ref } from 'vue'

export function useAnalyticsSummary () {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const data = ref<AnalyticsSummaryResponse | null>(null)

  onMounted(async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchAnalyticsSummary()
    } catch (e) {
      error.value = formatApiError(e)
      data.value = null
    } finally {
      loading.value = false
    }
  })

  const isEmpty = computed(() => {
    return (data.value?.summary.total_reports ?? 0) === 0
  })

  function formatLabelRisk (key: string): string {
    return formatLabel(key) || humanizeKey(key.replace(/_/g, ' '))
  }

  const riskRows = computed(() => {
    const dist = data.value?.risks.distribution ?? {}
    return Object.entries(dist)
      .map(([key, count]) => ({ key, label: formatLabelRisk(key), count }))
      .sort((a, b) => b.count - a.count)
  })

  const maxRiskCount = computed(() => {
    const rows = riskRows.value
    if (!rows.length) {
      return 1
    }
    return Math.max(1, ...rows.map((r) => r.count))
  })

  const oppTotal = computed(() => {
    const o = data.value?.opportunities
    if (!o) {
      return 0
    }
    return o.high + o.medium + o.low
  })

  const convTotal = computed(() => {
    const c = data.value?.conversion_signals
    if (!c) {
      return 0
    }
    return c.ready_to_start + c.needs_discovery + c.high_risk
  })

  const clientTotal = computed(() => {
    const c = data.value?.clients
    if (!c) {
      return 0
    }
    return ANALYTICS_CLIENT_TYPE_ORDER.reduce((sum, key) => sum + c[key], 0)
  })

  const clientTypeSegments = computed(() => {
    const c = data.value?.clients
    const total = clientTotal.value
    if (!c || total <= 0) {
      return [] as {
        key: AnalyticsClientTypeKey
        label: string
        count: number
        pct: number
        stackClass: string
        dotClass: string
      }[]
    }
    return ANALYTICS_CLIENT_TYPE_ORDER.map((key) => {
      const count = c[key]
      const suffix = ANALYTICS_CLIENT_TYPE_STYLE_KEYS[key]
      return {
        key,
        label: ANALYTICS_CLIENT_TYPE_LABELS[key],
        count,
        pct: pct(count, total),
        stackClass: `stack-bar__seg--ct-${suffix}`,
        dotClass: `dot--ct-${suffix}`,
      }
    })
  })

  const timelineBars = computed(() => {
    const t = data.value?.timeline ?? []
    const maxR = Math.max(1, ...t.map((x) => x.reports))
    return t.map((row) => ({
      ...row,
      barPct: (row.reports / maxR) * 100
    }))
  })

  const sparkPoints = computed(() => {
    const t = data.value?.timeline ?? []
    if (t.length < 2) {
      return ''
    }
    const maxS = Math.max(1e-6, ...t.map((x) => x.avg_score))
    const w = 100
    const h = 22
    const padX = 1
    const padY = 3
    return t
      .map((row, i) => {
        const x = padX + (i / (t.length - 1)) * (w - 2 * padX)
        const y = h - padY - (row.avg_score / maxS) * (h - 2 * padY)
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  })

  const firstTimelinePoint = computed(() => {
    const t = data.value?.timeline ?? []
    return t.length === 1 ? t[0] : null
  })

  return {
    loading,
    error,
    data,
    isEmpty,
    riskRows,
    maxRiskCount,
    oppTotal,
    convTotal,
    clientTotal,
    clientTypeSegments,
    timelineBars,
    sparkPoints,
    firstTimelinePoint,
    pct,
    shortDate,
    fmt1,
  }
}
