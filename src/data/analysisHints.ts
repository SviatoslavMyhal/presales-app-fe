export type AnalysisHintKind = 'tip' | 'fact'

export type AnalysisHintEntry = {
  kind: AnalysisHintKind
  label: string
  body: string
}

/** Product tips and sales facts — shown at random while the pipeline runs */
export const ANALYSIS_HINTS: AnalysisHintEntry[] = [
  {
    kind: 'tip',
    label: 'Workspace',
    body: 'Sign in to save reports and reopen them anytime from My reports.',
  },
  {
    kind: 'fact',
    label: 'Did you know?',
    body: 'The best discovery calls feel like interviews — you talk less than the prospect.',
  },
  {
    kind: 'tip',
    label: 'Analytics',
    body: 'Signed-in users get workspace analytics: trends, risk mix, and client-type signals across saved reports.',
  },
  {
    kind: 'fact',
    label: 'Did you know?',
    body: 'Silence after you share pricing is often processing, not rejection — resist filling the gap too fast.',
  },
  {
    kind: 'tip',
    label: 'Save smarter',
    body: 'Add an optional title when saving so reports stay easy to scan in your list.',
  },
  {
    kind: 'fact',
    label: 'Did you know?',
    body: 'Presales teams that document discovery win more — memory fades, written signals don’t.',
  },
  {
    kind: 'tip',
    label: 'Exports',
    body: 'After analysis you can export Markdown or JSON, or print / save as PDF from the report.',
  },
  {
    kind: 'fact',
    label: 'Did you know?',
    body: 'Framing ROI around their metrics beats generic ROI slides every time.',
  },
  {
    kind: 'fact',
    label: 'Did you know?',
    body: 'A clear “why us, why now” beats a longer feature list in early-stage deals.',
  },
  {
    kind: 'fact',
    label: 'Did you know?',
    body: 'The first five minutes often decide whether you’re seen as vendor or partner.',
  },
]
