import { ArrowUpRight, ChevronRight } from 'lucide-react'
import SearchForm from '../components/SearchForm.jsx'
import WhyRelevant from '../components/WhyRelevant.jsx'
import { href } from '../lib/route.js'
import { projectById } from '../data/catalog.js'

export default function Results({
  q,
  setQ,
  onSearch,
  interpreting,
  result,
  indexStatus,
  people,
  projects,
}) {
  const concepts = result?.concepts || []
  const hits = result?.hits || []

  return (
    <section className="page results-page">
      <div className="results-search">
        <SearchForm q={q} setQ={setQ} onSubmit={onSearch} examples={false} />
      </div>

      {(interpreting || indexStatus === 'indexing') && (
        <div className="interpret" aria-live="polite">
          <small>I’m looking for</small>
          <div className="chips">
            {(concepts.length ? concepts : ['Meaning in your question']).map((c) => (
              <em key={c} className="chip-in">
                {c}
              </em>
            ))}
          </div>
        </div>
      )}

      {!interpreting && result && (
        <>
          {concepts.length > 0 && (
            <div className="interpret persist">
              <small>Related concepts</small>
              <div className="chips">
                {concepts.map((c) => (
                  <em key={c}>{c}</em>
                ))}
              </div>
            </div>
          )}

          {result.mode === 'fallback' && (
            <p className="honest-note">
              Semantic search could not run in this browser. These results use keyword matching.
            </p>
          )}

          <h1 className="results-intro">{result.intro}</h1>

          {result.mode === 'uncertain' && (
            <p className="lede">These might still be useful — they share a neighbouring problem, not a close match.</p>
          )}

          <ol className="result-list">
            {hits.map((hit, i) => {
              const m = hit.memory
              const proj = projectById(m.projectId, projects)
              return (
                <li key={m.id} className="result-item">
                  <a className="result-link" href={href('memory', { id: m.id, from: 'search' })}>
                    <div className="meta">
                      <span>{m.type}</span>
                      <small>
                        {m.office} · {m.discipline} · {m.year}
                      </small>
                    </div>
                    <h2>
                      <span className="idx">0{i + 1}</span>
                      {m.title}
                    </h2>
                    <p>{m.summary}</p>
                    <small className="proj-line">
                      {proj?.public ? 'Public project' : 'Project'} · {proj?.name || 'Independent'}
                    </small>
                  </a>
                  <WhyRelevant why={hit.why} relation={hit.relation} concepts={hit.shared.length ? hit.shared : m.concepts} />
                  <a className="text-link" href={href('memory', { id: m.id, from: 'search' })}>
                    View memory <ArrowUpRight size={14} />
                  </a>
                </li>
              )
            })}
          </ol>

          {result.mode === 'uncertain' && (
            <div className="uncertain-actions">
              <p>
                <strong>Try a broader question</strong> — name the user, the feeling, or the kind of system, not the document you think exists.
              </p>
              <KnowSomeone people={people} memories={hits.map((h) => h.memory)} />
            </div>
          )}

          {result.mode === 'confident' && hits.length > 0 && (
            <KnowSomeone people={people} memories={hits.map((h) => h.memory)} />
          )}
        </>
      )}
    </section>
  )
}

function KnowSomeone({ people, memories }) {
  const ids = new Set(memories.flatMap((m) => m.people || []))
  const matches = people.filter((p) => ids.has(p.id)).slice(0, 3)
  if (!matches.length) return null
  return (
    <div className="know-someone">
      <small>Find someone who knows about this</small>
      <div className="person-row">
        {matches.map((p) => (
          <a key={p.id} href={href('people', { id: p.id, from: memories[0]?.id })}>
            <b>{p.initials}</b>
            <span>
              {p.name}
              <small>
                {p.role} · {p.office}
              </small>
            </span>
            <ChevronRight size={14} />
          </a>
        ))}
      </div>
    </div>
  )
}
