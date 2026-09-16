import { cosine, lexicalScore, memoryText, vectorFor } from './embed.js'
import { explainWhy, extractConcepts, relationFor, sharedConcepts } from './concepts.js'

export const STRONG = 0.38
export const USEFUL = 0.28
export const WEAK = 0.18

export { extractConcepts }

export async function retrieve(query, memories, { semantic = true } = {}) {
  const concepts = extractConcepts(query)
  if (!query.trim()) {
    return { query, concepts, hits: [], mode: 'browse', intro: '' }
  }

  let scored
  if (semantic) {
    try {
      const qv = await vectorFor('query:' + query, query)
      scored = []
      for (const m of memories) {
        const mv = await vectorFor(m.id, memoryText(m))
        const semanticScore = cosine(qv, mv)
        const lexical = lexicalScore(query, m)
        const shared = sharedConcepts(concepts, m)
        const conceptBoost = shared.length * 0.015
        const score = semanticScore + lexical * 0.08 + conceptBoost
        scored.push({ memory: m, score, semanticScore, shared })
      }
    } catch (err) {
      console.error(err)
      return retrieveLexical(query, memories, concepts, 'fallback')
    }
  } else {
    return retrieveLexical(query, memories, concepts, 'keyword')
  }

  scored.sort((a, b) => b.score - a.score)
  const top = scored[0]
  const confident = top && top.semanticScore >= USEFUL
  const pool = scored.filter((s) => s.semanticScore >= (confident ? WEAK : 0.12)).slice(0, confident ? 4 : 3)

  const hits = pool.map((s) => {
    const relation = relationFor(s.memory, s.shared)
    return {
      memory: s.memory,
      relation,
      shared: s.shared,
      why: explainWhy(query, s.memory, s.shared.length ? s.shared : s.memory.concepts || [], relation),
      strength: s.semanticScore >= STRONG ? 'close' : s.semanticScore >= USEFUL ? 'related' : 'loose',
    }
  })

  const intro = confident
    ? hits.length === 1
      ? 'I found 1 thing that might help.'
      : `I found ${hits.length} things that might help.`
    : 'I couldn’t find a close match.'

  return {
    query,
    concepts,
    hits,
    mode: confident ? 'confident' : 'uncertain',
    intro,
  }
}

function retrieveLexical(query, memories, concepts, mode) {
  const scored = memories
    .map((m) => {
      const shared = sharedConcepts(concepts, m)
      const lex = lexicalScore(query, m)
      return { memory: m, score: lex + shared.length * 0.2, shared, lex }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  const hits = scored.map((s) => {
    const relation = relationFor(s.memory, s.shared)
    return {
      memory: s.memory,
      relation,
      shared: s.shared,
      why: explainWhy(query, s.memory, s.shared.length ? s.shared : s.memory.concepts || [], relation),
      strength: s.lex > 0.4 ? 'related' : 'loose',
    }
  })

  return {
    query,
    concepts,
    hits,
    mode: mode === 'fallback' ? 'fallback' : hits.length ? 'keyword' : 'uncertain',
    intro: hits.length ? `I found ${hits.length} things using ${mode === 'fallback' ? 'keyword search (semantic model unavailable)' : 'keyword search'}.` : 'I couldn’t find a close match.',
  }
}

export function neighbours(memory, memories, limit = 3) {
  const mine = new Set(memory.concepts || [])
  return memories
    .filter((m) => m.id !== memory.id)
    .map((m) => ({
      m,
      n: (m.concepts || []).filter((c) => mine.has(c)).length + (memory.related?.includes(m.id) ? 2 : 0),
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((x) => x.m)
}
