import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { href } from '../lib/route.js'
import { memoriesForPerson, personById, projectById } from '../data/catalog.js'
import { neighbours } from '../search/retrieve.js'

export default function Memory({ memory, memories, people, projects, from, query }) {
  const proj = projectById(memory.projectId, projects)
  const related = (memory.related || [])
    .map((id) => memories.find((m) => m.id === id))
    .filter(Boolean)
  const extra = neighbours(memory, memories, 4).filter((m) => !related.find((r) => r.id === m.id))
  const trail = [...related, ...extra].slice(0, 4)

  return (
    <article className="page memory-page thread-page">
      <p className="kicker">
        {memory.type} · {memory.office} · {memory.year}
        <span className="proto-tag">{memory.provenance?.kind || 'Prototype memory'}</span>
      </p>
      <h1>{memory.title}</h1>
      <p className="summary">{memory.summary}</p>

      {query && (
        <p className="why-now">
          <small>Why this might matter now</small>
          {memory.matter}
        </p>
      )}

      <div className="sections">
        <Section title="Context" body={memory.context} lead="What were we trying to solve?" />
        <Section title="What we tried" body={memory.tried} lead="What did we explore?" />
        <Section title="What we learned" body={memory.finding} lead="What changed our understanding?" highlight />
        <Section title="Decision" body={memory.decision} lead="What changed because of this learning?" />
        <Section title="Looking back" body={memory.looking} lead="What would we do differently now?" />
      </div>

      {memory.matter && !query && (
        <div className="matter">
          <h2>Why this might matter now</h2>
          <p>{memory.matter}</p>
        </div>
      )}

      <div className="thread-block">
        <div>
          <small>People</small>
          <h2>Who should I talk to?</h2>
          <div className="thread-list">
            {memory.people.map((id) => {
              const p = personById(id, people)
              if (!p) return null
              const count = memoriesForPerson(id, memories).length
              return (
                <a key={id} className="thread-item" href={href('people', { id, from: memory.id })}>
                  <b>{p.initials}</b>
                  <span>
                    {p.name}
                    <small>
                      {p.role} · {p.office} · {count} memories
                    </small>
                  </span>
                  <em>Ask about this work</em>
                  <ChevronRight size={14} />
                </a>
              )
            })}
          </div>
        </div>
        <div>
          <small>Project</small>
          <h2>Where this happened</h2>
          {proj && (
            <a className="thread-item project-thread" href={href('projects', { id: proj.id, from: memory.id })}>
              <span>
                {proj.name}
                <small>
                  {proj.public ? 'Public project' : 'Project'} · {proj.office} · {proj.disciplines}
                </small>
              </span>
              <ArrowUpRight size={14} />
            </a>
          )}
          {memory.provenance && (
            <p className="provenance">
              <small>Source</small>
              {memory.provenance.publicFact}{' '}
              {memory.provenance.url && (
                <a href={memory.provenance.url} target="_blank" rel="noreferrer">
                  Public case ↗
                </a>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="related">
        <small>Follow the thread</small>
        <h2>Related memories</h2>
        <div className="related-list">
          {trail.map((m) => (
            <a key={m.id} href={href('memory', { id: m.id, from: memory.id })}>
              <span>{m.type}</span>
              <strong>{m.title}</strong>
              <ChevronRight size={14} />
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

function Section({ title, body, lead, highlight }) {
  if (!body) return null
  return (
    <section className={highlight ? 'mem-section highlight' : 'mem-section'}>
      <header>
        <h2>{title}</h2>
        <small>{lead}</small>
      </header>
      <p>{body}</p>
    </section>
  )
}
