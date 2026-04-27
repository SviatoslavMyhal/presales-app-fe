import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    label?: string
    /** When true, route requires a valid access token */
    requiresAuth?: boolean
  }
}

// TODO: Here you define you global vue definitions. Uncomment if needed
// declare module 'vue' {
// interface ComponentCustomProperties {
// }
// }

export { }
