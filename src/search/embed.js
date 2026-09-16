import { pipeline, env } from '@huggingface/transformers'

env.allowLocalModels = false
env.useBrowserCache = true

const cache = new Map()
const inflight = new Map()
let extractorPromise = null

export async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'fp32' })
  }
  return extractorPromise
}

export async function embed(text) {
  const model = await getExtractor()
  const out = await model(text, { pooling: 'mean', normalize: true })
  return Array.from(out.data)
}

export function memoryText(m) {
  return [
    m.title,
    m.summary,
    m.context,
    m.tried,
    m.finding,
    m.decision,
    m.looking,
    m.type,
    m.office,
    m.discipline,
    (m.concepts || m.tags || []).join(' '),
  ]
    .filter(Boolean)
    .join('. ')
}

export function cosine(a, b) {
  let s = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) s += a[i] * b[i]
  return s
}

export async function vectorFor(id, text) {
  if (cache.has(id)) return cache.get(id)
  if (inflight.has(id)) return inflight.get(id)
  const pending = embed(text).then((v) => {
    cache.set(id, v)
    inflight.delete(id)
    return v
  })
  inflight.set(id, pending)
  return pending
}

export function dropVector(id) {
  cache.delete(id)
}

export async function indexMemories(memories, onProgress) {
  let i = 0
  for (const m of memories) {
    await vectorFor(m.id, memoryText(m))
    i += 1
    onProgress?.(i, memories.length)
  }
}

export function lexicalScore(q, m) {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  if (!words.length) return 0
  const text = memoryText(m).toLowerCase()
  return words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0) / words.length
}
