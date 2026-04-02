import { reportsDelete, reportsList } from '@/api/reports.api'
import type { ReportListItem } from '@/api/backend-types'
import { routeNames } from '@/router/route-names-registry'
import { formatApiError } from '@/utils/api-error'
import { confirmDeleteReport } from '@/utils/confirmDeleteReport'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

/** Page size for reports list pagination (must match API `limit`). */
export const REPORTS_LIST_PAGE_SIZE = 10

export function useReportsList () {
  const router = useRouter()
  const limit = REPORTS_LIST_PAGE_SIZE

  const offset = ref(0)
  const reports = ref<ReportListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const deletingId = ref<string | null>(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      const res = await reportsList({ limit, offset: offset.value })
      reports.value = res.reports
    } catch (e) {
      error.value = formatApiError(e)
      reports.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  watch(offset, load)

  function goDetail (id: string) {
    router.push({ name: routeNames.reportDetail, params: { id } })
  }

  async function onDeleteReport (row: ReportListItem, e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (deletingId.value) {
      return
    }
    try {
      await confirmDeleteReport(row.title || 'Untitled report')
    } catch {
      return
    }
    deletingId.value = row.id
    try {
      await reportsDelete(row.id)
      ElMessage.success('Report deleted')
      await load()
    } catch (err) {
      ElMessage.error(formatApiError(err))
    } finally {
      deletingId.value = null
    }
  }

  function nextPage () {
    if (reports.value.length >= limit) {
      offset.value += limit
    }
  }

  function prevPage () {
    if (offset.value >= limit) {
      offset.value -= limit
    }
  }

  function formatDate (iso: string) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    } catch {
      return iso
    }
  }

  const pageLabel = computed(() => {
    const start = offset.value + 1
    const end = offset.value + reports.value.length
    if (!reports.value.length) {
      return ''
    }
    return `${start}–${end}`
  })

  return {
    limit,
    offset,
    reports,
    loading,
    error,
    deletingId,
    goDetail,
    onDeleteReport,
    nextPage,
    prevPage,
    formatDate,
    pageLabel,
  }
}
