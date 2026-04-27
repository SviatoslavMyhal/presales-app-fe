/**
 * Detects a completed HTTP 200 response where multi-agent presales pipeline failed
 * (e.g. invalid/insufficient job post). Backend may still return partial blocks (e.g. intelligence success).
 */
export function isPresalesPipelineFailed(result: unknown): boolean {
  if (!result || typeof result !== 'object') {
    return false
  }
  const r = result as Record<string, unknown>
  const synthesis = r.synthesis as Record<string, unknown> | undefined
  if (synthesis?.status === 'error') {
    return true
  }
  const analyst = r.analyst as Record<string, unknown> | undefined
  if (analyst?.status === 'error') {
    return true
  }
  return false
}

/** User-visible message; validation-specific first, then synthesis / analyst errors. */
export function getPresalesPipelineFailureMessage(result: unknown): string {
  const r = result as Record<string, unknown>
  const synthesis = r.synthesis as Record<string, unknown> | undefined
  const analyst = r.analyst as Record<string, unknown> | undefined

  const validation = analyst?.validation
  if (validation === 'INVALID_PROJECT') {
    return 'Your job post does not include enough detail for a presales analysis. Describe the role, goals, and technical context more clearly, then try again.'
  }

  const synErr = synthesis?.error
  if (typeof synErr === 'string' && synErr.trim()) {
    return synErr.trim()
  }

  const analystErr = analyst?.error
  if (typeof analystErr === 'string' && analystErr.trim()) {
    return analystErr.trim()
  }

  return 'The analysis could not be completed with the information provided. Please improve your job post and try again.'
}
