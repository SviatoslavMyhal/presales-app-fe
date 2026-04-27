/**
 * Human-readable labels for backend snake_case / enum-style keys.
 * Keys are normalized: lowercase, spaces → underscores.
 * Add entries as the API exposes new values.
 */
export const LABEL_MAP: Record<string, string> = {
  // Risk types & similar tags
  unrealistic_expectations: 'Unrealistic expectations',
  scope_creep: 'Scope creep',
  technical_debt: 'Technical debt',
  unclear_ownership: 'Unclear ownership',
  budget_risk: 'Budget risk',
  timeline_risk: 'Timeline risk',
  communication_gap: 'Communication gap',
  quality_risk: 'Quality risk',
  compliance_risk: 'Compliance risk',
  vendor_lock_in: 'Vendor lock-in',
  integration_risk: 'Integration risk',

  // Discovery question categories
  process: 'Process',
  success_criteria: 'Success criteria',
  technical: 'Technical',
  business: 'Business',
  stakeholder: 'Stakeholder',
  timeline: 'Timeline',
  budget: 'Budget',
  quality: 'Quality',
  security: 'Security',

  // Positioning angles
  expertise: 'Expertise',
  trust: 'Trust',
  speed: 'Speed',
  risk_mitigation: 'Risk mitigation',
  domain_fit: 'Domain fit',

  // Call strategy — tone (single words)
  consultative: 'Consultative',
  reassuring: 'Reassuring',
  exploratory: 'Exploratory',
  direct: 'Direct',
  collaborative: 'Collaborative',

  // Solution approach step types (examples)
  phase: 'Phase',
  milestone: 'Milestone',
  deliverable: 'Deliverable',
  discovery: 'Discovery',
  implementation: 'Implementation',
  rollout: 'Rollout',
}
