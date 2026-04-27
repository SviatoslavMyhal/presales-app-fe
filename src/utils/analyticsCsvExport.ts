import { downloadTextFile, reportExportDateStamp } from '@/utils/exportReport'

function escapeCsvCell(value: string | number): string {
  if (value === '') {
    return ''
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  const s = String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rowToLine(cells: (string | number)[]): string {
  return cells.map(escapeCsvCell).join(',')
}

export interface RiskRowForCsv { key: string, label: string, count: number }

export interface ClientSegmentForCsv {
  key: string
  label: string
  count: number
  pct: number
}

export interface AnalyticsCsvExportOptions {
  /** Workspace total report count from summary KPI (metadata row). */
  totalReports?: number
}

/**
 * One CSV: metadata key/value rows, then a single data table.
 * - `section`: `risk` (distribution of risk labels) or `client_type` (client mix).
 * - `pct`: for risks, share of total risk occurrences (sum of counts); for client types, % of all classified clients.
 */
export function downloadAnalyticsRisksClientCsv(
  riskRows: RiskRowForCsv[],
  clientSegments: ClientSegmentForCsv[],
  options?: AnalyticsCsvExportOptions,
): void {
  const lines: string[] = []
  const generatedAt = new Date().toISOString()

  lines.push(rowToLine(['field', 'value']))
  lines.push(rowToLine(['export', 'presales_workspace_analytics']))
  lines.push(rowToLine(['generated_at', generatedAt]))
  if (options?.totalReports !== undefined) {
    lines.push(rowToLine(['total_reports', options.totalReports]))
  }

  lines.push('')
  lines.push(rowToLine(['section', 'key', 'label', 'count', 'pct']))

  const riskDenom = riskRows.reduce((sum, r) => sum + r.count, 0)
  for (const r of riskRows) {
    const share
      = riskDenom > 0
        ? Math.round((r.count / riskDenom) * 1000) / 10
        : ''
    lines.push(rowToLine(['risk', r.key, r.label, r.count, share]))
  }

  for (const s of clientSegments) {
    lines.push(rowToLine(['client_type', s.key, s.label, s.count, s.pct]))
  }

  const stamp = reportExportDateStamp()
  const body = `\uFEFF${lines.join('\n')}\n`
  downloadTextFile(
    `analytics-workspace-${stamp}.csv`,
    body,
    'text/csv;charset=utf-8',
  )
}
