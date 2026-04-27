/**
 * Many generator endpoints return `{ status: "success" | "error", error, data }`.
 */
export function assertGeneratorSuccess(raw: unknown, fallbackMessage = 'Generation failed'): void {
  if (!raw || typeof raw !== 'object') {
    return
  }
  const o = raw as Record<string, unknown>
  if (o.status === 'error') {
    const msg
      = typeof o.error === 'string' && o.error.trim()
        ? o.error
        : typeof o.code === 'string' || typeof o.code === 'number'
          ? String(o.code)
          : fallbackMessage
    throw new Error(msg)
  }
}
