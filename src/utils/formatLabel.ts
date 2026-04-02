import { LABEL_MAP } from '@/config/labelMaps'

/**
 * Split snake_case / kebab-case / runs of spaces into Title Case words.
 */
export function humanizeKey(input: string): string {
  const s = input.trim()
  if (!s) {
    return ''
  }
  return s
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

function titleCaseToken(value: string): string {
  if (!value) {
    return ''
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/**
 * Map backend snake_case labels to readable copy. Uses {@link LABEL_MAP} when present,
 * otherwise humanizes strings that contain underscores; preserves normal sentences.
 */
export function formatLabel(value: string | null | undefined): string {
  if (value == null) {
    return ''
  }
  const raw = value.trim()
  if (!raw) {
    return ''
  }

  const mapped = LABEL_MAP[normalizeKey(raw)]
  if (mapped) {
    return mapped
  }

  if (raw.includes('_')) {
    return humanizeKey(raw)
  }

  // Single-token enums like "consultative" from the API
  if (/^[a-z][a-z0-9]*$/i.test(raw) && !raw.includes(' ')) {
    return titleCaseToken(raw)
  }

  return raw
}
