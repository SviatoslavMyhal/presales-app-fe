import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'

import { VueGlobalPropertiesPlugin } from '@/plugins'
import { router } from '@/router'
import { routeNames } from '@/router/route-names-registry'
import { useAuthStore } from '@/stores/auth.store'

import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const auth = useAuthStore()
auth.readFromStorage()
auth.registerUnauthorizedRedirect(() => {
  const r = router.currentRoute.value
  if (r.name === routeNames.login || r.name === routeNames.signup) {
    return
  }
  router.replace({ name: routeNames.login, query: { redirect: r.fullPath } })
})
void auth.hydrateUser()

app.use(VueGlobalPropertiesPlugin)
app.mount('#app')

export {
  app
}
