/**
 * Normalizes public briefing API payloads — supports `payload.briefing` and flat shapes.
 */
export interface BriefingSectionBlock {
  heading?: string
  title?: string
  content?: string
  body?: string
}

export interface BriefingDocumentModel {
  title: string
  meta?: { tone?: string }
  intro?: string
  closing?: string
  sections: BriefingSectionBlock[]
}

function sectionText(s: BriefingSectionBlock): string {
  const c = s.content ?? s.body
  return typeof c === 'string' ? c : ''
}

function sectionHeading(s: BriefingSectionBlock): string {
  const h = s.heading ?? s.title
  return typeof h === 'string' ? h : 'Section'
}

export function parseBriefingDocument(apiResponse: unknown): BriefingDocumentModel | null {
  if (!apiResponse || typeof apiResponse !== 'object') {
    return null
  }
  const root = apiResponse as Record<string, unknown>
  const payload = root.payload
  let doc: Record<string, unknown> | null = null

  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>
    if (p.briefing && typeof p.briefing === 'object') {
      doc = p.briefing as Record<string, unknown>
    }
    else {
      doc = p
    }
  }
  else {
    doc = root
  }

  if (!doc) {
    return null
  }

  const sectionsRaw = doc.sections
  const sections: BriefingSectionBlock[] = Array.isArray(sectionsRaw)
    ? sectionsRaw.filter((x): x is BriefingSectionBlock =>
        x !== null && typeof x === 'object',
      )
    : []

  let intro = typeof doc.intro === 'string' ? doc.intro : undefined
  if (!intro?.trim() && typeof doc.body === 'string' && doc.body.trim()) {
    intro = doc.body
  }
  const closing = typeof doc.closing === 'string' ? doc.closing : undefined
  const titleRaw = doc.title
  const title = typeof titleRaw === 'string' && titleRaw.trim()
    ? titleRaw.trim()
    : 'Client briefing'

  const metaObj = doc.meta
  const meta
    = metaObj && typeof metaObj === 'object'
      ? { tone: typeof (metaObj as Record<string, unknown>).tone === 'string'
          ? (metaObj as Record<string, unknown>).tone as string
          : undefined }
      : undefined

  const hasContent
    = Boolean(intro?.trim())
      || Boolean(closing?.trim())
      || sections.length > 0

  if (!hasContent) {
    return null
  }

  return {
    title,
    meta,
    intro,
    closing,
    sections,
  }
}

export function briefingDocumentToPlainText(doc: BriefingDocumentModel, createdAt?: string): string {
  const lines: string[] = [doc.title, '']
  if (createdAt) {
    lines.push(`Updated: ${createdAt}`, '')
  }
  if (doc.meta?.tone) {
    lines.push(`Tone: ${doc.meta.tone}`, '')
  }
  if (doc.intro?.trim()) {
    lines.push(doc.intro.trim(), '')
  }
  for (const s of doc.sections) {
    lines.push(sectionHeading(s), sectionText(s), '')
  }
  if (doc.closing?.trim()) {
    lines.push(doc.closing.trim())
  }
  return lines.join('\n').trim()
}
