const CONCEPTS = [
  { name: 'AI', terms: ['ai', 'artificial intelligence', 'intelligent', 'generative', 'model', 'machine', 'llm', 'agent'] },
  { name: 'Trust', terms: ['trust', 'trustworthy', 'reassur', 'confidence', 'believ'] },
  { name: 'User confidence', terms: ['confidence', 'sure', 'reassure', 'intimidat', 'scary', 'safe'] },
  { name: 'Transparency', terms: ['transparen', 'visible', 'reveal', 'show the', 'explain', 'boundary', 'boundaries'] },
  { name: 'Uncertainty', terms: ['uncertain', 'not sure', 'doubt', 'black box', 'opacity', 'unsure'] },
  { name: 'Control', terms: ['control', 'agency', 'steer', 'interrupt', 'handoff', 'in charge'] },
  { name: 'Automation', terms: ['automat', 'seamless', 'too much', 'less automation'] },
  { name: 'Onboarding', terms: ['onboard', 'first-run', 'first run', 'getting started', 'introduce', 'first time', 'new user'] },
  { name: 'Progressive disclosure', terms: ['progressive disclosure', 'gradually', 'layers', 'all at once', 'overwhelm', 'complex products'] },
  { name: 'Cognitive load', terms: ['overwhelm', 'intimidat', 'too much', 'cognitive', 'complex', 'clutter'] },
  { name: 'Prototyping', terms: ['prototype', 'prototyping', 'spec', 'coded', 'behaviour', 'behavior'] },
  { name: 'Rejected directions', terms: ['reject', 'did not work', "didn't work", 'didnt work', 'why not', 'abandoned', 'failed', 'mistake', 'killed'] },
  { name: 'Collaboration', terms: ['design and development', 'lockstep', 'handoff', 'together', 'constraint', 'engineers', 'developers'] },
  { name: 'Defaults', terms: ['default', 'easiest', 'least resistance', 'path of least', 'opt in'] },
  { name: 'Voice', terms: ['voice', 'speech', 'speak', 'spoken'] },
  { name: 'Everyday technology', terms: ['everyday', 'ordinary', 'familiar', 'home', 'domestic', 'demystif'] },
]

function includesTerm(hay, term) {
  if (term.includes(' ')) return hay.includes(term)
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${escaped}`).test(hay)
}

const EXPAND = {
  Trust: ['User confidence', 'Transparency'],
  AI: ['Control'],
  Onboarding: ['Progressive disclosure'],
  'Cognitive load': ['Progressive disclosure'],
  'Rejected directions': ['Decisions'],
}

export function extractConcepts(text) {
  const hay = (text || '').toLowerCase()
  const found = []
  for (const c of CONCEPTS) {
    if (c.terms.some((t) => includesTerm(hay, t))) found.push(c.name)
  }
  const expanded = [...found]
  for (const name of found) {
    for (const extra of EXPAND[name] || []) {
      if (!expanded.includes(extra)) expanded.push(extra)
    }
  }
  return expanded
}

export function sharedConcepts(queryConcepts, memory) {
  const mem = new Set([...(memory.concepts || []), ...(memory.tags || [])])
  return queryConcepts.filter((c) => mem.has(c) || [...mem].some((m) => m.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(m.toLowerCase())))
}

export const RELATION = {
  similar: 'Similar problem',
  need: 'Related user need',
  interaction: 'Same interaction challenge',
  technology: 'Related technology',
  contrast: 'Useful contrast',
}

export function relationFor(memory, shared) {
  if (memory.type === 'Reflection' || memory.type === 'Decision') {
    if (shared.includes('Rejected directions') || shared.includes('Automation') || shared.includes('Control')) {
      return RELATION.contrast
    }
  }
  if (shared.includes('Onboarding') || shared.includes('Progressive disclosure') || shared.includes('Cognitive load')) {
    return RELATION.interaction
  }
  if (shared.includes('Trust') || shared.includes('User confidence') || shared.includes('Uncertainty')) {
    return RELATION.need
  }
  if (shared.includes('AI') || shared.includes('Voice') || shared.includes('Prototyping')) {
    return RELATION.technology
  }
  return shared.length ? RELATION.similar : RELATION.similar
}

const PRIORITY = [
  'Trust',
  'User confidence',
  'Uncertainty',
  'Transparency',
  'Progressive disclosure',
  'Onboarding',
  'Cognitive load',
  'Rejected directions',
  'Control',
  'Automation',
  'Voice',
  'Collaboration',
  'Defaults',
  'Prototyping',
  'Everyday technology',
  'AI',
]

function pickFocus(shared, memory) {
  const pool = (shared?.length ? shared : memory.concepts) || []
  const ranked = [...pool].sort((a, b) => {
    const ia = PRIORITY.indexOf(a)
    const ib = PRIORITY.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
  return ranked[0] || 'a related challenge'
}

function phrase(name) {
  if (name === 'AI') return 'AI'
  return String(name).toLowerCase()
}

export function explainWhy(query, memory, shared, relation) {
  const focus = pickFocus(shared, memory)
  const lowerFocus = phrase(focus)

  if (relation === RELATION.contrast) {
    return `This is a useful contrast: it captures what happened when a related direction was tested and then changed — relevant if you’re trying to build ${lowerFocus} without losing control.`
  }
  if (relation === RELATION.interaction) {
    return `Both explore how to introduce unfamiliar functionality gradually without overwhelming people — a ${lowerFocus} problem.`
  }
  if (relation === RELATION.need) {
    return `You’re exploring ${lowerFocus}. This memory looks at a related challenge: helping people build confidence when they don’t fully understand what the system is doing.`
  }
  if (relation === RELATION.technology) {
    return `Both sit in the same technical neighbourhood — ${lowerFocus} — even if the original project used different words.`
  }
  return `This memory deals with ${lowerFocus}, which is close to the problem in your question, even if the wording is different.`
}
