import { reportsDelete, reportsGetById } from '@/api/reports.api'
import type { ReportDetail } from '@/api/backend-types'
import type { IntelligenceResponse, SynthesisReport } from '@/types/presales'
import { routeNames } from '@/router/route-names-registry'
import { formatApiError } from '@/utils/api-error'
import { confirmDeleteReport } from '@/utils/confirmDeleteReport'
import {
  extractStoredInputFields,
  extractStoredIntelligence,
  extractSynthesisReport,
} from '@/utils/storedReport'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useReportDetail () {
  const route = useRoute()
  const router = useRouter()

  const loading = ref(true)
  const error = ref<string | null>(null)
  const report = ref<ReportDetail | null>(null)
  const deleting = ref(false)

  const synthesisReport = computed((): SynthesisReport | null => {
    if (!report.value?.result) {
      return null
    }
    return extractSynthesisReport(report.value.result)
  })

  const intelligence = computed((): IntelligenceResponse | undefined => {
    return extractStoredIntelligence(report.value?.result)
  })

  const analyzeContext = computed(() => extractStoredInputFields(report.value?.result))

  async function load () {
    const id = route.params.id as string
    if (!id) {
      error.value = 'Missing report id'
      loading.value = false
      return
    }
    loading.value = true
    error.value = null
    try {
      report.value = await reportsGetById(id)
    } catch (e) {
      error.value = formatApiError(e)
      report.value = null
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  function back () {
    router.push({ name: routeNames.reports })
  }

  async function onRequestDelete () {
    const id = report.value?.id
    if (!id || deleting.value) {
      return
    }
    try {
      await confirmDeleteReport(report.value?.title ?? '')
    } catch {
      return
    }
    deleting.value = true
    try {
      await reportsDelete(id)
      ElMessage.success('Report deleted')
      await router.push({ name: routeNames.reports })
    } catch (e) {
      ElMessage.error(formatApiError(e))
    } finally {
      deleting.value = false
    }
  }

  return {
    loading,
    error,
    report,
    deleting,
    synthesisReport,
    intelligence,
    analyzeContext,
    load,
    back,
    onRequestDelete,
  }
}
