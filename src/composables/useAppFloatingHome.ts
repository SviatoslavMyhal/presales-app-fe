import { routeNames } from '@/router/route-names-registry'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** Routes that already include workspace chrome or full-screen report tools. */
const hideFloatingHome = new Set<string>([
  routeNames.home,
  routeNames.analyze,
  routeNames.today,
  routeNames.pipeline,
  routeNames.reportsAnalytics,
  routeNames.opportunityDetail,
])

export function useAppFloatingHome() {
  const route = useRoute()
  const router = useRouter()

  const showFloatingHome = computed(() => {
    const n = route.name as string | undefined
    if (!n) {
      return true
    }
    return !hideFloatingHome.has(n)
  })

  function goHome() {
    void router.push({ name: routeNames.home })
  }

  return { showFloatingHome, goHome }
}
