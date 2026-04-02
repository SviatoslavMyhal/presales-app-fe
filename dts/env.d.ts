/* eslint-disable @typescript-eslint/naming-convention */
/// <reference types="vite/client" />

/* UPDATE DEPENDING ON YOUR PROJRCT NEEDS */

interface ImportMetaEnv {
  /** Presales backend base URL (no trailing slash), e.g. http://localhost:3000 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
