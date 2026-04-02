/** Percentage with one decimal place (0–100). */
export function pct (part: number, total: number): number {
  if (total <= 0) {
    return 0
  }
  return Math.round((part / total) * 1000) / 10
}

export function shortDate (iso: string): string {
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

export function fmt1 (n: number): string {
  return Number.isFinite(n) ? n.toFixed(1) : '—'
}
