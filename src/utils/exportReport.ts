import type { SynthesisReport } from '@/types/presales'
import { formatLabel } from '@/utils/formatLabel'

/** ISO-like date for filenames: 2026-04-01 */
export function reportExportDateStamp(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}

function mdEscapeLine(s: string): string {
  return s.replace(/\r\n/g, '\n').replace(/^(\s{0,3})#/gm, '$1\\#')
}

function paragraph(text: string): string {
  const t = mdEscapeLine(text.trim())
  if (!t) {
    return ''
  }
  return `${t}\n\n`
}

function bulletList(items: string[]): string {
  const lines = items.map(x => x.trim()).filter(Boolean)
  if (!lines.length) {
    return ''
  }
  return `${lines.map(line => `- ${mdEscapeLine(line).replace(/\n/g, '\n  ')}`).join('\n')}\n\n`
}

/**
 * Full-text export of the synthesis report (same data as the on-screen report body;
 * intelligence widgets are UI-only and are not included).
 */
export function synthesisReportToMarkdown(report: SynthesisReport): string {
  const parts: string[] = []
  const stamp = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  parts.push('# PreSales report')
  parts.push('')
  parts.push(`_Generated ${stamp}_`)
  parts.push('')

  if (report.final_prep_note?.trim()) {
    parts.push('## Prep note')
    parts.push('')
    parts.push(paragraph(report.final_prep_note))
  }

  if (report.opportunity_summary?.trim()) {
    parts.push('## Opportunity')
    parts.push('')
    parts.push(paragraph(report.opportunity_summary))
  }

  const needs = report.client_needs
  if (needs && (needs.main_need?.trim() || needs.hidden_needs?.length)) {
    parts.push('## Client needs')
    parts.push('')
    if (needs.main_need?.trim()) {
      parts.push('### Main need')
      parts.push('')
      parts.push(paragraph(needs.main_need))
    }
    if (needs.hidden_needs?.length) {
      parts.push('### Hidden needs')
      parts.push('')
      parts.push(bulletList(needs.hidden_needs.map(h => formatLabel(h))))
    }
  }

  const dq = report.discovery_questions ?? []
  if (dq.length) {
    parts.push('## Discovery questions')
    parts.push('')
    dq.forEach((q, i) => {
      parts.push(`### ${i + 1}. ${formatLabel(q.category)}`)
      parts.push('')
      if (q.question?.trim()) {
        parts.push(paragraph(q.question))
      }
      if (q.why_it_matters?.trim()) {
        parts.push(`_Why it matters:_ ${mdEscapeLine(q.why_it_matters.trim()).replace(/\n/g, ' ')}`)
        parts.push('')
      }
    })
  }

  const risks = report.risks ?? []
  if (risks.length) {
    parts.push('## Risks')
    parts.push('')
    risks.forEach((r, i) => {
      parts.push(`### ${i + 1}. ${formatLabel(r.severity)} · ${formatLabel(r.type)}`)
      parts.push('')
      if (r.risk?.trim()) {
        parts.push(paragraph(r.risk))
      }
      if (r.mitigation_hint?.trim()) {
        parts.push(`_Mitigation:_ ${mdEscapeLine(r.mitigation_hint.trim())}`)
        parts.push('')
      }
    })
  }

  const pos = report.suggested_positioning ?? []
  if (pos.length) {
    parts.push('## Suggested positioning')
    parts.push('')
    pos.forEach((p, i) => {
      parts.push(`### ${i + 1}. ${formatLabel(p.angle)}`)
      parts.push('')
      if (p.statement?.trim()) {
        parts.push(paragraph(p.statement))
      }
    })
  }

  const approach = report.solution_approach ?? []
  if (approach.length) {
    parts.push('## Solution approach')
    parts.push('')
    approach.forEach((s, i) => {
      parts.push(`### ${i + 1}. ${formatLabel(s.type)}`)
      parts.push('')
      if (s.point?.trim()) {
        parts.push(paragraph(s.point))
      }
    })
  }

  const cs = report.call_strategy
  if (cs) {
    const hasStrategy
      = cs.primary_goal?.trim()
        || cs.tone?.trim()
        || cs.desired_outcome?.trim()
        || (cs.focus_areas?.length ?? 0) > 0
        || (cs.questions_to_lead_with?.length ?? 0) > 0

    if (hasStrategy) {
      parts.push('## Call strategy')
      parts.push('')
      if (cs.primary_goal?.trim()) {
        parts.push('### Primary goal')
        parts.push('')
        parts.push(paragraph(cs.primary_goal))
      }
      if (cs.tone?.trim()) {
        parts.push('### Tone')
        parts.push('')
        parts.push(paragraph(formatLabel(cs.tone)))
      }
      if (cs.desired_outcome?.trim()) {
        parts.push('### Desired outcome')
        parts.push('')
        parts.push(paragraph(cs.desired_outcome))
      }
      if (cs.focus_areas?.length) {
        parts.push('### Focus areas')
        parts.push('')
        parts.push(bulletList(cs.focus_areas.map(a => formatLabel(a))))
      }
      const lead = cs.questions_to_lead_with ?? []
      if (lead.length) {
        parts.push('### Questions to lead with')
        parts.push('')
        lead.forEach((q, i) => {
          parts.push(`#### ${i + 1}. ${q.question?.trim() || 'Question'}`)
          parts.push('')
          if (q.reason?.trim()) {
            parts.push(`_${mdEscapeLine(q.reason.trim())}_`)
            parts.push('')
          }
        })
      }
    }
  }

  return parts.join('\n').trim() + '\n'
}
