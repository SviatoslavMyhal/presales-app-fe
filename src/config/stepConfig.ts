import StepField from '@/components/steps/StepField.vue'
import type { StepConfig } from '@/types/stepForm'

export const stepConfig: StepConfig[] = [
  {
    key: 'job_post',
    component: StepField,
    title: 'Project Description',
    description: 'Paste the job post or project brief from your client',
    placeholder:
      'We\'re looking for a team to build a SaaS platform that...',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    optional: false,
    minRows: 7,
    rule: {
      required: true,
      minLength: 30,
      errorMessage:
        'Please provide a project description (at least 30 characters)',
    },
    hint: 'The more detail you provide, the sharper the analysis',
  },
  {
    key: 'client_messages',
    component: StepField,
    title: 'Client Messages',
    description: 'Any additional messages or context from the client',
    placeholder:
      'The client mentioned they want to launch by Q3 and already have a designer...',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    optional: true,
    minRows: 4,
    rule: {
      required: false,
      errorMessage: '',
    },
  },
  {
    key: 'team_expertise',
    component: StepField,
    title: 'Team Expertise',
    description: 'Your skills, stack, and relevant background',
    placeholder:
      'We are a 4-person team specializing in Node.js, Vue 3, and PostgreSQL. We have delivered 3 SaaS products...',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    optional: true,
    minRows: 4,
    rule: {
      required: false,
      errorMessage: '',
    },
    hint: 'Helps the agent tailor positioning to your actual strengths',
  },
  {
    key: 'constraints',
    component: StepField,
    title: 'Constraints',
    description: 'Budget, timeline, timezone, engagement model',
    placeholder:
      'Fixed budget around $15–20k, 3-month timeline, client is UTC+1, prefers weekly syncs...',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    optional: true,
    minRows: 3,
    rule: {
      required: false,
      errorMessage: '',
    },
  },
]
