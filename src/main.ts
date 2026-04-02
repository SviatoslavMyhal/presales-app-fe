import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'

import { VueGlobalPropertiesPlugin } from '@/plugins'
import { router } from '@/router'
import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'
import { handleAuthHashCallback } from '@/utils/auth-hash-callback'

import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function bootstrapAuth () {
  const auth = useAuthStore()
  auth.readFromStorage()
  await router.isReady()
  const handled = await handleAuthHashCallback(router)
  if (!handled) {
    await auth.hydrateUser()
  }
  auth.registerUnauthorizedRedirect(() => {
    const r = router.currentRoute.value
    if (r.name === routeNames.login || r.name === routeNames.signup) {
      return
    }
    router.replace({ name: routeNames.login, query: { redirect: r.fullPath } })
  })
}

app.use(VueGlobalPropertiesPlugin)

void bootstrapAuth().then(() => {
  app.mount('#app')
})

export {
  app
}
