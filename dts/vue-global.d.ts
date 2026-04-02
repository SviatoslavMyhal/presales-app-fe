export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $formatLabel: (value: string | null | undefined) => string
  }
}
