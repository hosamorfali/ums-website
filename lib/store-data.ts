/* ── UMS Template Store — source of truth ─────────────── */

export type Category = {
  id: string
  name: string
  active: boolean
}

export type Template = {
  id: string
  name: string
  shortName: string          // display name in the network (without "The " prefix)
  category: string
  tagline: string
  price: number
  isKit: boolean
  images: string[]           // public paths
  builtFor: string[]
  pairsWith: string[]        // template IDs (for Pairs With section)
  shopifyVariantId: string   // fill in from Shopify admin
}

export const CATEGORIES: Category[] = [
  { id: 'diagnostic',        name: 'Diagnostic Frameworks', active: true },
  { id: 'strategy',          name: 'Strategy',              active: true },
  { id: 'signature',         name: 'Signature Frameworks',  active: true },
  { id: 'operating-model',   name: 'Operating Model',       active: false },
  { id: 'project-management',name: 'Project Management',    active: false },
]

export const TEMPLATES: Template[] = [
  {
    id: 'competitive-landscape',
    name: 'The Competitive Landscape Framework',
    shortName: 'Competitive Landscape',
    category: 'strategy',
    tagline: 'Define where you stand, and where the opportunity lives',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The Competitive Landscape Framework/Competitive_Landscape_Preview_1.PNG',
      '/images/Template Images/The Competitive Landscape Framework/Competitive_Landscape_Preview_2.PNG',
      '/images/Template Images/The Competitive Landscape Framework/Competitive_Landscape_Preview_3.PNG',
      '/images/Template Images/The Competitive Landscape Framework/Competitive_Landscape_Preview_4.PNG',
    ],
    builtFor: [
      'Entering or scanning a new market',
      'Developing a Proposal that requires market landscape context',
      'Anchoring Strategy in competitive reality',
    ],
    pairsWith: ['swot-analysis'],
    shopifyVariantId: '',
  },
  {
    id: 'swot-analysis',
    name: 'The SWOT Analysis Framework',
    shortName: 'SWOT Analysis',
    category: 'strategy',
    tagline: 'Know your reality before you choose your direction',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The SWOT Analysis Framework/SWOT_Preview_1.PNG',
      '/images/Template Images/The SWOT Analysis Framework/SWOT_Preview_2.PNG',
      '/images/Template Images/The SWOT Analysis Framework/SWOT_Preview_3.PNG',
    ],
    builtFor: [
      'Starting a new strategy cycle',
      'Building a situation analysis for a proposal or pitch',
      'Evaluating a business, department, or project before a major decision',
    ],
    pairsWith: ['competitive-landscape'],
    shopifyVariantId: '',
  },
  {
    id: 'strategy-house',
    name: 'The Strategy House Framework',
    shortName: 'Strategy House',
    category: 'strategy',
    tagline: 'Your entire strategic architecture, from purpose to priorities, on one page',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The Strategy House Framework/Strategy_House_Preview_1.PNG',
      '/images/Template Images/The Strategy House Framework/Strategy_House_Preview_2.PNG',
      '/images/Template Images/The Strategy House Framework/Strategy_House_Preview_3.PNG',
    ],
    builtFor: [
      'Building a unified strategic architecture',
      'Presenting strategy to a board or investor',
      'Resetting annual priorities',
    ],
    pairsWith: ['strategic-roadmap'],
    shopifyVariantId: '',
  },
  {
    id: 'strategic-roadmap',
    name: 'The Strategic Roadmap Framework',
    shortName: 'Strategic Roadmap',
    category: 'strategy',
    tagline: 'What gets done, in what order, and why the sequence matters',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The Strategic Roadmap/Strategic_Roadmap_Preview_1.PNG',
      '/images/Template Images/The Strategic Roadmap/Strategic_Roadmap_Preview_2.PNG',
      '/images/Template Images/The Strategic Roadmap/Strategic_Roadmap_Preview_3.PNG',
    ],
    builtFor: [
      'Translating strategy into a phased execution plan',
      'Presenting a three-year plan to stakeholders',
      'Sequencing initiatives across pillars and years',
    ],
    pairsWith: ['strategy-house'],
    shopifyVariantId: '',
  },
  {
    id: 'initiative-card',
    name: 'The Initiative Card Framework',
    shortName: 'Initiative Card',
    category: 'strategy',
    tagline: 'Scope every initiative, clearly defined, accountable, and ready to execute',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The Initiative Card/Initiative_Card_Preview_1.PNG',
      '/images/Template Images/The Initiative Card/Initiative_Card_Preview_2.PNG',
      '/images/Template Images/The Initiative Card/Initiative_Card_Preview_3.PNG',
    ],
    builtFor: [
      'Defining and detailing a strategic initiative',
      'Assigning ownership and setting success metrics',
      'Preparing Initiatives for Approval',
    ],
    pairsWith: ['initiative-prioritization'],
    shopifyVariantId: '',
  },
  {
    id: 'initiative-prioritization',
    name: 'The Initiative Prioritization Framework',
    shortName: 'Initiative Prioritization',
    category: 'strategy',
    tagline: 'Commit to what matters and deprioritise what does not',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The Initiative Prioritization Framework/Initiative_Priorities_Preview_1.PNG',
      '/images/Template Images/The Initiative Prioritization Framework/Initiative_Priorities_Preview_2.PNG',
      '/images/Template Images/The Initiative Prioritization Framework/Initiative_Priorities_Preview_3.PNG',
    ],
    builtFor: [
      'Ranking initiatives before committing resources',
      'Facilitating a strategic prioritisation session',
      'Making trade-off decisions',
    ],
    pairsWith: ['initiative-card'],
    shopifyVariantId: '',
  },
  {
    id: 'kpis-success-metrics',
    name: 'The KPIs & Success Metrics Framework',
    shortName: 'KPIs & Success Metrics',
    category: 'strategy',
    tagline: 'Track what actually tells you the strategy is working',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The KPIs & Success Metrics Framework/KPIs_Success_Metrics_Preview_1.PNG',
      '/images/Template Images/The KPIs & Success Metrics Framework/KPIs_Success_Metrics_Preview_2.PNG',
      '/images/Template Images/The KPIs & Success Metrics Framework/KPIs_Success_Metrics_Preview_3.PNG',
    ],
    builtFor: [
      'Building a KPI register for a strategic plan',
      'Aligning measurement to strategic objectives',
      'Reporting performance to leadership or board',
    ],
    pairsWith: ['strategy-house'],
    shopifyVariantId: '',
  },
  {
    id: 'strategic-positioning',
    name: 'The Strategic Positioning Framework',
    shortName: 'Strategic Positioning',
    category: 'strategy',
    tagline: 'Define where you play and how you win',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/The Strategic Positioning Framework/Strategic_Positioning_Preview_1.PNG',
      '/images/Template Images/The Strategic Positioning Framework/Strategic_Positioning_Preview_2.PNG',
      '/images/Template Images/The Strategic Positioning Framework/Strategic_Positioning_Preview_3.PNG',
    ],
    builtFor: [
      'Setting or refreshing strategic direction',
      'Differentiating clearly from competitors',
      'Alignment before committing to a direction',
    ],
    pairsWith: ['strategy-house'],
    shopifyVariantId: '',
  },
  {
    id: 'strategic-direction-kit',
    name: 'The Strategic Direction Kit',
    shortName: 'Strategic Direction Kit',
    category: 'strategy',
    tagline: 'Everything you need to build, present, and own a complete strategic direction',
    price: 1000,
    isKit: true,
    images: [
      '/images/Template Images/The Strategic Direction Kit/Strategic_Direction_Kit_1.PNG',
    ],
    builtFor: [
      'Running a full strategy cycle from positioning to execution',
      'Consulting teams delivering end-to-end strategic engagements',
      'Organisations launching or refreshing their strategic direction',
    ],
    pairsWith: [],
    shopifyVariantId: '',
  },
]

export const KIT_INCLUDES = [
  'SWOT Analysis Framework',
  'Competitive Landscape Framework',
  'Strategic Positioning Framework',
  'Strategy House Framework',
  'Strategic Roadmap Framework',
  'Initiative Card Framework',
  'Initiative Priorities Framework',
  'KPIs & Success Metrics Framework',
]

export const KIT_OPENING =
  '8 consultant-grade frameworks covering the full journey from understanding your competitive reality to measuring strategic performance — each with a filled example, an empty template, and a structured presentation ready to use.'

export function getTemplatesByCategory(categoryId: string): Template[] {
  return TEMPLATES.filter(t => t.category === categoryId)
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id)
}
