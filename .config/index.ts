import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Linter } from 'eslint'
import type { Plugin } from 'vite'
import { globSync } from 'tinyglobby'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

export const eslintRules: Linter.Config['rules'] = {
  'vue/multi-word-component-names': 'off',
}

export function AutoImportComponents() {
  return Components({
    dirs: [
      'src/components',
      'src/views',
      'src/features/platform/icons',
      'src/features/platform/modals',
    ],
    extensions: ['vue'],
    deep: true,
    dts: 'dts/auto-imports/auto-import-components.d.ts',
    resolvers: [ElementPlusResolver()],
  })
}

export function AutoImportScripts() {
  return AutoImport({
    imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
    dirs: [
      'src/composables',
      'src/utils',
      'src/stores',
      'src/store',
      'src/plugins',
      'src/services',
      'src/features/platform/api',
      'src/views/home',
    ],
    dts: 'dts/auto-imports/auto-import-scripts.d.ts',
    vueTemplate: true,
    eslintrc: {
      enabled: true,
      filepath: path.join(__dirname, 'auto-imports/auto-import.json'),
      globalsPropValue: 'readonly',
    },
    resolvers: [ElementPlusResolver()],
  })
}

export function IconNamesGenerator(): Plugin {
  const iconsDir = path.join(root, 'src/features/platform/icons/assets')
  const outFile = path.join(root, 'src/features/platform/icons/icons.d.ts')

  const write = () => {
    if (!fs.existsSync(iconsDir)) {
      return
    }
    const files = globSync('**/*.svg', { cwd: iconsDir })
    const names = [...new Set(files.map(f => path.basename(f, '.svg')))].sort()
    const union = names.map(n => `'${n}'`).join(' | ') || 'never'
    const content = `/* Auto-generated icons names - do not edit manually */
type TIcons = ${union}
`
    if (fs.existsSync(outFile) && fs.readFileSync(outFile, 'utf8') === content) {
      return
    }
    fs.writeFileSync(outFile, content)
  }

  return {
    name: 'icon-names-generator',
    buildStart: write,
    configureServer(server) {
      server.watcher.add(iconsDir)
      server.watcher.on('change', (file) => {
        if (file.startsWith(iconsDir)) {
          write()
        }
      })
    },
  }
}

export function ModalsGenerator(): Plugin {
  const registryFile = path.join(root, 'src/features/platform/modals/modals-registry.ts')

  const write = () => {
    const files = globSync('src/views/**/modals/**/*.vue', {
      cwd: root,
      absolute: true,
    })
    const registryDir = path.dirname(registryFile)
    const lines = files
      .map((abs) => {
        const rel = path.relative(registryDir, abs).replace(/\\/g, '/')
        const importPath = rel.startsWith('.') ? rel : `./${rel}`
        const base = path.basename(abs, '.vue')
        return `  ${base}: () => defineAsyncComponent(() => import('${importPath}'))`
      })
      .sort()
    const body = lines.join(',\n')
    const content = `/* Auto-generated modals registry - do not edit manually */
export const Modals = {
${body}
}
`
    if (fs.existsSync(registryFile) && fs.readFileSync(registryFile, 'utf8') === content) {
      return
    }
    fs.writeFileSync(registryFile, content)
  }

  return {
    name: 'modals-generator',
    buildStart: write,
    configureServer(server) {
      const watchDir = path.join(root, 'src/views')
      server.watcher.add(watchDir)
      server.watcher.on('change', (file) => {
        if (file.includes(`${path.sep}modals${path.sep}`) && file.endsWith('.vue')) {
          write()
        }
      })
    },
  }
}

export function RouteNamesGenerator(): Plugin {
  const routesFile = path.join(root, 'src/router/app.routes.ts')
  const outFile = path.join(root, 'src/router/route-names-registry.ts')

  const write = () => {
    const src = fs.readFileSync(routesFile, 'utf8')
    const keys: string[] = []
    const seen = new Set<string>()
    for (const m of src.matchAll(/routeNames\.(\w+)/g)) {
      const k = m[1]
      if (!seen.has(k)) {
        seen.add(k)
        keys.push(k)
      }
    }
    const entries = keys.map(k => `  ${k}: '${k}'`).join(',\n')
    const content = `/* Auto-generated route names registry - do not edit manually */
export const routeNames = {
${entries}
}
`
    if (fs.existsSync(outFile) && fs.readFileSync(outFile, 'utf8') === content) {
      return
    }
    fs.writeFileSync(outFile, content)
  }

  return {
    name: 'route-names-generator',
    buildStart: write,
    configureServer(server) {
      server.watcher.add(routesFile)
      server.watcher.on('change', (file) => {
        if (file === routesFile) {
          write()
        }
      })
    },
  }
}
