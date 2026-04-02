import { routeNames } from '@/router/route-names-registry'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useAppFloatingHome () {
  const route = useRoute()
  const router = useRouter()

  const showFloatingHome = computed(
    () => route.name !== routeNames.home && route.name !== routeNames.reportDetail,
  )

  function goHome () {
    router.push({ name: routeNames.home })
  }

  return { showFloatingHome, goHome }
}
