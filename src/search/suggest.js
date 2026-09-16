import { extractConcepts } from './concepts.js'
import { neighbours } from './retrieve.js'

function shortTitle(text) {
  if (!text) return 'Untitled memory'
  const sentence = text.split(/[.!?]/)[0].trim()
  if (sentence.length <= 70) return sentence
  const cut = sentence.slice(0, 70)
  const sp = cut.lastIndexOf(' ')
  return `${(sp > 36 ? cut.slice(0, sp) : cut).trim()}…`
}

export function suggestMetadata(draft, catalog) {
  const blob = `${draft.learned || ''} ${draft.workingOn || ''} ${draft.shouldKnow || ''}`
  const concepts = extractConcepts(blob)
  const learned = (draft.learned || draft.shouldKnow || '').trim()
  const title = draft.title?.trim() || shortTitle(learned)

  let type = 'Learning'
  if (/did not|didn't|reject|instead|we stopped|we dropped/i.test(blob)) type = 'Decision'
  else if (/prototype|experiment|we tried|we tested/i.test(blob)) type = 'Experiment'
  else if (/looking back|next time|would do differently/i.test(blob)) type = 'Reflection'

  const relatedMemories = neighbours(
    { id: 'draft', concepts, related: [] },
    catalog.memories,
    3,
  )

  const projectIds = [...new Set(relatedMemories.map((m) => m.projectId).filter(Boolean))]
  const relatedProjects = catalog.projects.filter((p) => projectIds.includes(p.id)).slice(0, 2)

  const summary = (draft.shouldKnow || learned).split(/[.!?]/)[0].trim().slice(0, 180)

  return {
    title,
    summary,
    type,
    concepts: concepts.slice(0, 6),
    relatedMemories,
    relatedProjects,
  }
}
