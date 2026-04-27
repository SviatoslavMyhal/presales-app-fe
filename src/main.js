import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { VueGlobalPropertiesPlugin } from '@/plugins'
import '@/assets/styles/main.css'
const app = createApp(App)
app
  .use(createPinia())
  .use(VueGlobalPropertiesPlugin)
app.mount('#app')
export { app }
