/// <reference types="vite/client" />

/* UPDATE DEPENDING ON YOUR PROJRCT NEEDS */

interface ImportMetaEnv {
  /** Presales backend base URL (no trailing slash), e.g. http://localhost:3000 */
  readonly VITE_API_URL?: string
  /** Alias for `VITE_API_URL` (same semantics). */
  readonly VITE_API_BASE_URL?: string
  /** Next.js-style name; exposed in Vite when `envPrefix` includes `NEXT_PUBLIC_`. */
  readonly NEXT_PUBLIC_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
