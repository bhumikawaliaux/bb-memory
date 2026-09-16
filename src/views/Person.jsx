import { ChevronRight } from 'lucide-react'
import { href } from '../lib/route.js'
import { memoriesForPerson, memoryById, projectById } from '../data/catalog.js'

export default function Person({ person, memories, projects, from }) {
  const owned = memoriesForPerson(person.id, memories)
  const origin = from ? memoryById(from, memories) : null
  const ranked = origin
    ? [...owned].sort((a, b) => Number(b.id === origin.id) - Number(a.id === origin.id) || overlap(origin, b) - overlap(origin, a))
    : owned
  const projectIds = [...new Set(owned.map((m) => m.projectId).filter(Boolean))]
  const topics = [...new Set(owned.flatMap((m) => m.concepts || []))]

  return (
    <section className="page thread-page person-page">
      <p className="kicker">
        {person.role} · {person.office}
        {person.fictional && <span className="proto-tag">Fictional composite</span>}
      </p>
      <h1>{person.name}</h1>
      <p className="summary">{person.bio}</p>

      {origin && (
        <p className="why-here">
          <small>Why you’re here</small>
          You found {person.name.split(' ')[0]} through work on {origin.title}.
        </p>
      )}

      <div className="person-grid">
        <div>
          <small>Ask me about</small>
          <div className="chips">
            {person.askAbout.map((t) => (
              <em key={t}>{t}</em>
            ))}
          </div>
          <small className="spaced">Things I’ve explored</small>
          <div className="chips">
            {topics.slice(0, 8).map((t) => (
              <em key={t}>{t}</em>
            ))}
          </div>
        </div>
        <div>
          <small>Projects</small>
          <div className="thread-list">
            {projectIds.map((id) => {
              const pr = projectById(id, projects)
              return (
                pr && (
                  <a key={id} className="thread-item" href={href('projects', { id, from: person.id })}>
                    <span>
                      {pr.name}
                      <small>
                        {pr.office} · {pr.kind}
                      </small>
                    </span>
                    <ChevronRight size={14} />
                  </a>
                )
              )
            })}
          </div>
        </div>
      </div>

      <div className="related">
        <small>Memories</small>
        <h2>{origin ? 'Start with the relevant work' : 'What I’ve learned'}</h2>
        <div className="related-list">
          {ranked.map((m) => (
            <a key={m.id} href={href('memory', { id: m.id, from: person.id })}>
              <span>{m.type}</span>
              <strong>{m.title}</strong>
              <ChevronRight size={14} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function overlap(a, b) {
  const s = new Set(a.concepts || [])
  return (b.concepts || []).filter((c) => s.has(c)).length
}
