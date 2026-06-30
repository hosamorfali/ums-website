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
  fileExtension?: 'Powerpoint' | 'Excel' | 'Word'
}

export const CATEGORIES: Category[] = [
  { id: 'strategy',           name: 'Strategy Frameworks',             active: true  },
  { id: 'startup',            name: 'Startup Businesses',              active: true  },
  { id: 'diagnostic',         name: 'Diagnostic Frameworks',           active: false },
  { id: 'signature',          name: 'Signature Frameworks',            active: false },
  { id: 'operating-model',    name: 'Operating Model & Governance',    active: false },
  { id: 'project-management', name: 'Project Management',              active: true  },
  { id: 'marketing-comms',    name: 'Marketing & Communication',       active: false },
  { id: 'sponsorship',        name: 'Sponsorship',                     active: false },
]

export const TEMPLATES: Template[] = [
  {
    id: 'competitive-landscape',
    name: 'The Competitive Landscape Framework',
    shortName: 'Competitive Landscape',
    category: 'strategy',
    tagline: 'Define where you stand, and where the opportunity lives',
    price: 250,
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
    shopifyVariantId: '45459176685747',
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
    shopifyVariantId: '45459175342259',
  },
  {
    id: 'strategy-house',
    name: 'The Strategy House Framework',
    shortName: 'Strategy House',
    category: 'strategy',
    tagline: 'Your entire strategic architecture, from purpose to priorities, on one page',
    price: 250,
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
    shopifyVariantId: '45456480927923',
  },
  {
    id: 'strategic-roadmap',
    name: 'The Strategic Roadmap Framework',
    shortName: 'Strategic Roadmap',
    category: 'strategy',
    tagline: 'What gets done, in what order, and why the sequence matters',
    price: 250,
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
    shopifyVariantId: '45459178324147',
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
    shopifyVariantId: '45459161252019',
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
    shopifyVariantId: '45459446169779',
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
    shopifyVariantId: '45459019858099',
  },
  {
    id: 'strategic-positioning',
    name: 'The Strategic Positioning Framework',
    shortName: 'Strategic Positioning',
    category: 'strategy',
    tagline: 'Define where you play and how you win',
    price: 250,
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
    shopifyVariantId: '45456503865523',
  },
  {
    id: 'strategic-direction-kit',
    name: 'The Strategic Direction Kit',
    shortName: 'Strategic Direction Kit',
    category: 'strategy',
    tagline: 'Everything you need to build, present, and own a complete strategic direction',
    price: 1250,
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
    shopifyVariantId: '45459185074355',
  },

  // ── Startup Businesses ───────────────────────────────────
  {
    id: 'startup-problem-opportunity',
    name: 'The Problem & Opportunity Statement',
    shortName: 'Problem & Opportunity',
    category: 'startup',
    tagline: 'Clarify the problem, customer, opportunity, and timing before building the solution',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Problem & Opportunity Statement/Problem_Opportunity_Statement_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Problem & Opportunity Statement/Problem_Opportunity_Statement_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Problem & Opportunity Statement/Problem_Opportunity_Statement_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Problem & Opportunity Statement/Problem_Opportunity_Statement_Preview_4.PNG',
    ],
    builtFor: [
      'Validating whether the idea addresses a real market gap',
      'Clarifying the customer pain before committing resources',
      'Aligning the team around the problem, opportunity, and timing',
    ],
    pairsWith: ['startup-business-model-canvas'],
    shopifyVariantId: '45562404208819',
  },
  {
    id: 'startup-business-model-canvas',
    name: 'The Business Model Canvas',
    shortName: 'Business Model Canvas',
    category: 'startup',
    tagline: 'Map how the business creates, delivers, and captures value',
    price: 250,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Business Model Canvas/Business_Model_Canvas_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Business Model Canvas/Business_Model_Canvas_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Business Model Canvas/Business_Model_Canvas_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Business Model Canvas/Business_Model_Canvas_Preview_4.PNG',
    ],
    builtFor: [
      'Structuring the core logic of a new business idea',
      'Connecting customers, channels, revenue, costs, and operations',
      'Testing whether the business model is clear before planning execution',
    ],
    pairsWith: ['startup-gtm-strategy'],
    shopifyVariantId: '45562404700339',
  },
  {
    id: 'startup-value-proposition-canvas',
    name: 'The Value Proposition Canvas',
    shortName: 'Value Proposition Canvas',
    category: 'startup',
    tagline: 'Clarify why customers should choose your offer over the alternatives',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Value Proposition Canvas/Value_Proposition_Canvas_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Value Proposition Canvas/Value_Proposition_Canvas_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Value Proposition Canvas/Value_Proposition_Canvas_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Value Proposition Canvas/Value_Proposition_Canvas_Preview_4.PNG',
    ],
    builtFor: [
      'Translating customer needs into a sharper offer',
      'Aligning products or services with pain points and desired gains',
      'Improving messaging, positioning, and product-market fit',
    ],
    pairsWith: ['startup-target-audience-persona'],
    shopifyVariantId: '45562404929715',
  },
  {
    id: 'startup-gtm-strategy',
    name: 'The Go-To-Market Strategy Approach',
    shortName: 'Go-To-Market Strategy',
    category: 'startup',
    tagline: 'Define how the business will reach, convert, and grow its customers',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Go-To-Market Strategy Approach/Go_To_Market_Strategy_Approach_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Go-To-Market Strategy Approach/Go_To_Market_Strategy_Approach_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Go-To-Market Strategy Approach/Go_To_Market_Strategy_Approach_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Go-To-Market Strategy Approach/Go_To_Market_Strategy_Approach_Preview_4.PNG',
    ],
    builtFor: [
      'Clarifying the entry point, offer, channel approach, and conversion path',
      'Turning market assumptions into a focused go-to-market objective',
      'Choosing channels, messages, and customer acquisition priorities',
    ],
    pairsWith: ['startup-business-model-canvas'],
    shopifyVariantId: '45562405028019',
  },
  {
    id: 'startup-target-audience-persona',
    name: 'The Target Audience Persona',
    shortName: 'Target Audience Persona',
    category: 'startup',
    tagline: 'Understand who the customer is, what they need, and why they buy',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Target Audience Persona/Target_Audience_Persona_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Target Audience Persona/Target_Audience_Persona_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Target Audience Persona/Target_Audience_Persona_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Target Audience Persona/Target_Audience_Persona_Preview_4.PNG',
    ],
    builtFor: [
      'Defining the ideal customer before building or marketing the offer',
      'Clarifying customer pains, motivations, behaviors, and buying triggers',
      'Aligning messaging, positioning, and acquisition around a specific audience',
    ],
    pairsWith: ['startup-value-proposition-canvas'],
    shopifyVariantId: '45562405355699',
  },
  {
    id: 'startup-competitive-landscape',
    name: 'The Competitive Landscape Framework',
    shortName: 'Competitive Landscape',
    category: 'startup',
    tagline: 'See where the business stands against competitors and alternatives',
    price: 250,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Competitive Landscape Framework/Competitive_Landscape_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Competitive Landscape Framework/Competitive_Landscape_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Competitive Landscape Framework/Competitive_Landscape_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Competitive Landscape Framework/Competitive_Landscape_Preview_4.PNG',
    ],
    builtFor: [
      'Mapping competitors, substitutes, and market alternatives',
      'Identifying gaps, white space, and sources of differentiation',
      'Supporting positioning, pricing, and market entry decisions',
    ],
    pairsWith: ['startup-business-model-canvas'],
    shopifyVariantId: '45562405454003',
  },
  {
    id: 'startup-strategy-house',
    name: 'The Strategy House Framework',
    shortName: 'Strategy House',
    category: 'startup',
    tagline: 'Connect purpose, priorities, and execution in one strategic view',
    price: 250,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Strategy House Framework/Strategy_House_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Strategy House Framework/Strategy_House_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Strategy House Framework/Strategy_House_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Strategy House Framework/Strategy_House_Preview_4.PNG',
    ],
    builtFor: [
      'Defining or resetting the strategic direction of the business',
      'Aligning teams around vision, priorities, and foundations',
      'Translating high-level ambition into clear strategic pillars',
    ],
    pairsWith: ['startup-business-model-canvas'],
    shopifyVariantId: '45562405552307',
  },
  {
    id: 'startup-pricing-direction',
    name: 'The Pricing Strategic Direction',
    shortName: 'Pricing Direction',
    category: 'startup',
    tagline: 'Set a strategically sound price by connecting cost, value, market position, and commercial logic',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Pricing Strategic Direction/Pricing_Strategic_Direction_1.PNG',
      '/images/Template Images/Startup Businesses/The Pricing Strategic Direction/Pricing_Strategic_Direction_2.PNG',
      '/images/Template Images/Startup Businesses/The Pricing Strategic Direction/Pricing_Strategic_Direction_3.PNG',
      '/images/Template Images/Startup Businesses/The Pricing Strategic Direction/Pricing_Strategic_Direction_4.PNG',
    ],
    builtFor: [
      'Setting the first price for a new product or service',
      'Resetting pricing when the current price lacks a clear rationale',
      'Aligning pricing with value, cost, positioning, and go-to-market strategy',
    ],
    pairsWith: ['startup-revenue-model'],
    shopifyVariantId: '45562405585075',
  },
  {
    id: 'startup-revenue-model',
    name: 'The Revenue Model Framework',
    shortName: 'Revenue Model',
    category: 'startup',
    tagline: 'Define how money flows into the business before building the financial plan',
    price: 300,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Revenue Model Framework/Revenue_Model_Framework_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Revenue Model Framework/Revenue_Model_Framework_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Revenue Model Framework/Revenue_Model_Framework_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Revenue Model Framework/Revenue_Model_Framework_Preview_4.PNG',
    ],
    builtFor: [
      'Choosing the primary and secondary revenue streams',
      'Clarifying who pays, what they pay for, and how revenue is generated',
      'Stress-testing the commercial logic before financial modelling',
    ],
    pairsWith: ['startup-pricing-direction'],
    shopifyVariantId: '45562406371507',
  },
  {
    id: 'startup-financial-projections',
    name: 'The Financial Projections',
    shortName: 'Financial Projections',
    category: 'startup',
    tagline: 'Translate the revenue model into numbers that show growth, costs, funding needs, and breakeven timing',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Financial Projections/Financial_Projections_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Financial Projections/Financial_Projections_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Financial Projections/Financial_Projections_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Financial Projections/Financial_Projections_Preview_4.PNG',
    ],
    builtFor: [
      'Preparing a credible financial outlook for investors or partners',
      'Estimating breakeven timing, profitability, and funding requirements',
      'Stress-testing whether the business model can scale financially',
    ],
    pairsWith: ['startup-revenue-model'],
    shopifyVariantId: '45562406502579',
  },
  {
    id: 'startup-investor-pitch',
    name: 'The Investor Pitch Framework',
    shortName: 'Investor Pitch',
    category: 'startup',
    tagline: 'Turn the business case into a clear investor-ready story',
    price: 250,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The Investor Pitch Framework/Investor_Pitch_Framework_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Investor Pitch Framework/Investor_Pitch_Framework_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Investor Pitch Framework/Investor_Pitch_Framework_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Investor Pitch Framework/Investor_Pitch_Framework_Preview_4.PNG',
    ],
    builtFor: [
      'Preparing a structured investor, lender, or partner presentation',
      'Communicating the problem, solution, market, model, traction, and ask',
      'Aligning the business narrative before fundraising conversations',
    ],
    pairsWith: ['startup-business-model-canvas'],
    shopifyVariantId: '45562406568115',
  },
  {
    id: 'startup-90-days-launch',
    name: 'The 90 Days Launch Plan',
    shortName: '90 Days Launch Plan',
    category: 'startup',
    tagline: 'Turn launch priorities into a focused 90-day execution plan',
    price: 300,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The 90 Days Launch Plan/90_Days_Launch_Plan_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The 90 Days Launch Plan/90_Days_Launch_Plan_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The 90 Days Launch Plan/90_Days_Launch_Plan_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The 90 Days Launch Plan/90_Days_Launch_Plan_Preview_4.PNG',
    ],
    builtFor: [
      'Preparing the business for its first structured launch cycle',
      'Breaking strategy into weekly actions, owners, and milestones',
      'Aligning the team around what must happen before and after launch',
    ],
    pairsWith: ['startup-gtm-strategy'],
    shopifyVariantId: '45562406633651',
  },
  {
    id: 'startup-kpis-metrics',
    name: 'The KPIs & Metrics Framework',
    shortName: 'KPIs & Metrics',
    category: 'startup',
    tagline: 'Track the numbers that show whether the business is working',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Startup Businesses/The KPIs & Metrics Framework/KPIs_And_Metrics_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The KPIs & Metrics Framework/KPIs_And_Metrics_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The KPIs & Metrics Framework/KPIs_And_Metrics_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The KPIs & Metrics Framework/Slide9.PNG',
    ],
    builtFor: [
      'Defining the most important measures of business performance',
      'Assigning targets, owners, status, and actions to each KPI',
      'Creating a simple performance view for leadership and execution reviews',
    ],
    pairsWith: ['startup-business-model-canvas'],
    shopifyVariantId: '45562406699187',
  },
  {
    id: 'startup-business-kit',
    name: 'The Startup Business Kit',
    shortName: 'Startup Business Kit',
    category: 'startup',
    tagline: 'Everything your business needs to validate the idea, build the foundation, plan the strategy, and prepare for launch',
    price: 1900,
    isKit: true,
    images: [
      '/images/Template Images/Startup Businesses/The Startup Business Kit/Startup_Business_Kit_Preview_1.PNG',
      '/images/Template Images/Startup Businesses/The Startup Business Kit/Startup_Business_Kit_Preview_2.PNG',
      '/images/Template Images/Startup Businesses/The Startup Business Kit/Startup_Business_Kit_Preview_3.PNG',
      '/images/Template Images/Startup Businesses/The Startup Business Kit/Startup_Business_Kit_Preview_4.PNG',
    ],
    builtFor: [],
    pairsWith: [],
    shopifyVariantId: '45562408894643',
  },

  // ── Project Management ───────────────────────────────────
  {
    id: 'project-scope-of-work',
    name: 'The Project Scope of Work Framework',
    shortName: 'Project Scope of Work',
    category: 'project-management',
    tagline: "Define the project's purpose, deliverables, boundaries, assumptions, and success expectations before execution begins",
    price: 250,
    isKit: false,
    images: [
      '/images/Template Images/Project Management/The Project Scope of Work Framework/Project_Scope_of_Work_Preview_1.PNG',
      '/images/Template Images/Project Management/The Project Scope of Work Framework/Project_Scope_of_Work_Preview_2.PNG',
      '/images/Template Images/Project Management/The Project Scope of Work Framework/Project_Scope_of_Work_Preview_3.PNG',
      '/images/Template Images/Project Management/The Project Scope of Work Framework/Project_Scope_of_Work_Preview_4.PNG',
    ],
    builtFor: [
      'Starting a new project and establishing the base',
      'Aligning stakeholders on scope, deliverables, assumptions, and exclusions',
      'Creating a clear project foundation before planning begins',
    ],
    pairsWith: ['project-plan-cps'],
    shopifyVariantId: '45609258025139',
    fileExtension: 'Powerpoint',
  },
  {
    id: 'project-plan-cps',
    name: 'The Project Plan & CPS Sheet',
    shortName: 'Project Plan & CPS',
    category: 'project-management',
    tagline: 'Turn project objectives into a structured execution plan with clear phases, milestones, and responsibilities',
    price: 350,
    isKit: false,
    images: [
      '/images/Template Images/Project Management/The Project Plan & CPS Sheet/Project_Plan_and_CPS_Preview_1.PNG',
      '/images/Template Images/Project Management/The Project Plan & CPS Sheet/Project_Plan_and_CPS_Preview_2.PNG',
      '/images/Template Images/Project Management/The Project Plan & CPS Sheet/Project_Plan_and_CPS_Preview_3.PNG',
    ],
    builtFor: [
      'Building a practical project roadmap from start to reporting',
      'Breaking work into phases, activities, owners, and timelines',
      'Tracking execution progress against planned commitments',
    ],
    pairsWith: ['project-status-update-timeline'],
    shopifyVariantId: '45609262514355',
  },
  {
    id: 'budget-cost-tracker',
    name: 'The Budget & Cost Tracker',
    shortName: 'Budget & Cost Tracker',
    category: 'project-management',
    tagline: 'Monitor planned budget, actual spend, and cost variance in one structured project finance view',
    price: 300,
    isKit: false,
    images: [
      '/images/Template Images/Project Management/The Budget & Cost Tracker/Budget_Cost_Tracker_Preview_1.PNG',
      '/images/Template Images/Project Management/The Budget & Cost Tracker/Budget_Cost_Tracker_Preview_2.PNG',
      '/images/Template Images/Project Management/The Budget & Cost Tracker/Budget_Cost_Tracker_Preview_3.PNG',
    ],
    builtFor: [
      'Managing project budgets across multiple cost categories',
      'Comparing planned costs against actual expenses',
      'Identifying overspend, remaining budget, and financial risks early',
    ],
    pairsWith: ['project-status-update-timeline'],
    shopifyVariantId: '45609263759539',
  },
  {
    id: 'minutes-of-meetings',
    name: 'The Minutes of Meetings Template',
    shortName: 'Minutes of Meetings',
    category: 'project-management',
    tagline: 'Capture decisions, action items, owners, and follow-ups from every project meeting',
    price: 200,
    isKit: false,
    images: [
      '/images/Template Images/Project Management/The Minutes of Meetings Template/Minutes_Of_Meeting_Preview_1.PNG',
      '/images/Template Images/Project Management/The Minutes of Meetings Template/Minutes_Of_Meeting_Preview_2.PNG',
      '/images/Template Images/Project Management/The Minutes of Meetings Template/Minutes_Of_Meeting_Preview_3.PNG',
    ],
    builtFor: [
      'Running structured project meetings with clear outcomes',
      'Documenting key decisions, discussion points, and assigned actions',
      'Following up on responsibilities before the next meeting',
    ],
    pairsWith: ['project-plan-cps'],
    shopifyVariantId: '45609263825075',
  },
  {
    id: 'project-status-update-timeline',
    name: 'The Project Status Update & Timeline Framework',
    shortName: 'Status Update & Timeline',
    category: 'project-management',
    tagline: 'Communicate project progress, timeline movement, risks, and next steps in a clear executive format',
    price: 250,
    isKit: false,
    images: [
      '/images/Template Images/Project Management/The Project Status Update & Timeline Framework/Project_Status_Update_and_Timeline_Preview_1.PNG',
      '/images/Template Images/Project Management/The Project Status Update & Timeline Framework/Project_Status_Update_and_Timeline_Preview_2.PNG',
      '/images/Template Images/Project Management/The Project Status Update & Timeline Framework/Project_Status_Update_and_Timeline_Preview_3.PNG',
      '/images/Template Images/Project Management/The Project Status Update & Timeline Framework/Project_Status_Update_and_Timeline_Preview_4.PNG',
    ],
    builtFor: [
      'Preparing weekly or monthly project status updates',
      'Reporting progress, blockers, milestones, and timeline changes',
      'Keeping sponsors and stakeholders aligned on project health',
    ],
    pairsWith: ['project-plan-cps'],
    shopifyVariantId: '45609263890611',
  },
  {
    id: 'kpi-tracker-dashboard',
    name: 'The KPI Tracker Dashboard',
    shortName: 'KPI Tracker Dashboard',
    category: 'project-management',
    tagline: 'Track project performance through measurable KPIs, status indicators, and progress summaries',
    price: 300,
    isKit: false,
    images: [
      '/images/Template Images/Project Management/The KPI Tracker Dashboard/KPI_Tracker_Dashboard_Preview_1.PNG',
      '/images/Template Images/Project Management/The KPI Tracker Dashboard/KPI_Tracker_Dashboard_Preview_2.PNG',
      '/images/Template Images/Project Management/The KPI Tracker Dashboard/KPI_Tracker_Dashboard_Preview_3.PNG',
    ],
    builtFor: [
      'Monitoring whether the project is achieving its intended results',
      'Tracking performance across delivery, budget, timeline, and outcomes',
      'Highlighting underperforming areas that need management attention',
    ],
    pairsWith: ['project-status-update-timeline'],
    shopifyVariantId: '45609263956147',
  },
  {
    id: 'project-management-kit',
    name: 'The Project Management Kit',
    shortName: 'Project Management Kit',
    category: 'project-management',
    tagline: 'Everything your project needs to define the scope, plan the work, track the budget, manage meetings, report progress, and monitor performance',
    price: 1000,
    isKit: true,
    images: [
      '/images/Template Images/Project Management/The Project Management Kit/Project_Management_Kit_Preview_1.PNG',
      '/images/Template Images/Project Management/The Project Management Kit/Project_Management_Kit_Preview_2.PNG',
      '/images/Template Images/Project Management/The Project Management Kit/Project_Management_Kit_Preview_3.PNG',
    ],
    builtFor: [],
    pairsWith: [],
    shopifyVariantId: '45609264054451',
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

// Per-kit content (opening description + included template names), keyed by kit template ID.
export const KIT_DETAILS: Record<string, { opening: string; includes: string[] }> = {
  'strategic-direction-kit': {
    opening: KIT_OPENING,
    includes: KIT_INCLUDES,
  },
  'startup-business-kit': {
    opening: 'Everything your business needs to validate the idea, build the foundation, plan the strategy, and prepare for launch',
    includes: [
      'The Problem & Opportunity Statement',
      'The Business Model Canvas',
      'The Value Proposition Canvas',
      'The Go-To-Market Strategy Approach',
      'The Target Audience Persona',
      'The Competitive Landscape Framework',
      'The Strategy House Framework',
      'The Pricing Strategic Direction',
      'The Revenue Model Framework',
      'The Financial Projections',
      'The Investor Pitch Framework',
      'The 90 Days Launch Plan',
      'The KPIs & Metrics Framework',
    ],
  },
  'project-management-kit': {
    opening: 'Everything your project needs to define the scope, plan the work, track the budget, manage meetings, report progress, and monitor performance.',
    includes: [
      'The Project Scope of Work Framework',
      'The Project Plan & CPS Sheet',
      'The Budget & Cost Tracker',
      'The Minutes of Meetings Template',
      'The Project Status Update & Timeline Framework',
      'The KPI Tracker Dashboard',
    ],
  },
}

// Returns the bundle kit template for a given category, if one exists.
export function getKitForCategory(categoryId: string): Template | undefined {
  return TEMPLATES.find(t => t.category === categoryId && t.isKit)
}

export function getTemplatesByCategory(categoryId: string): Template[] {
  return TEMPLATES.filter(t => t.category === categoryId)
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id)
}
