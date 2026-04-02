import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { routeNames } from '@/router/route-names-registry'

export function useReportsWorkspaceLede() {
  const route = useRoute()

  const lede = computed(() => {
    if (route.name === routeNames.reportsAnalytics) {
      return 'Aggregated presales intelligence from saved reports — trends, mix, and risk signals.'
    }
    return 'Open a saved analysis or explore workspace analytics.'
  })

  return { lede }
}
