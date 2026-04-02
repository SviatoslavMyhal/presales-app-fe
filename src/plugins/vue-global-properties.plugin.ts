import type { Plugin } from 'vue'
import { formatLabel } from '@/utils/formatLabel'

export const globalProperties = {
  $formatLabel: formatLabel
} as const

export const VueGlobalPropertiesPlugin: Plugin = {
  install: (app) => {
    for (const i in globalProperties) {
      app.config.globalProperties[i] = globalProperties[i as keyof typeof globalProperties]
    }
  }
}
