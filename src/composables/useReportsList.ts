import { reportsDelete, reportsList } from '@/api/reports.api'
import type { ReportListItem } from '@/api/backend-types'
import { routeNames } from '@/router/route-names-registry'
import { formatApiError } from '@/utils/api-error'
import { confirmDeleteReport } from '@/utils/confirmDeleteReport'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export function useReportsList () {
  const router = useRouter()

  const reports = ref<ReportListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const deletingId = ref<string | null>(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      const res = await reportsList()
      reports.value = res.reports
    } catch (e) {
      error.value = formatApiError(e)
      reports.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

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

  function formatDate (iso: string) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return iso
    }
  }

  return {
    reports,
    loading,
    error,
    deletingId,
    goDetail,
    onDeleteReport,
    formatDate,
  }
}
