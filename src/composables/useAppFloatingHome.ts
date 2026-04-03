import { routeNames } from '@/router/route-names-registry'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useAppFloatingHome () {
  const route = useRoute()
  const router = useRouter()

  /** Analyze route embeds its own toolbar (StepForm back / ReportView header); floating control duplicates the wordmark. */
  const showFloatingHome = computed(
    () =>
      route.name !== routeNames.home
      && route.name !== routeNames.reportDetail
      && route.name !== routeNames.analyze,
  )

  function goHome () {
    router.push({ name: routeNames.home })
  }

  return { showFloatingHome, goHome }
}
