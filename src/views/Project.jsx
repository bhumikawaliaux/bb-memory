import { ChevronRight } from 'lucide-react'
import { href } from '../lib/route.js'
import { memoriesForProject, personById } from '../data/catalog.js'

export default function Project({ project, memories, people, from }) {
  const owned = memoriesForProject(project.id, memories)
  const personIds = [...new Set(owned.flatMap((m) => m.people || []))]
  const byType = (t) => owned.filter((m) => m.type === t)

  return (
    <section className="page thread-page">
      <p className="kicker">
        {project.office} · {project.disciplines} · {project.year}
        <span className="proto-tag">{project.public ? 'Public project' : 'Prototype'}</span>
      </p>
      <h1>{project.name}</h1>
      <p className="summary">{project.summary}</p>
      {project.url && (
        <p>
          <a className="text-link" href={project.url} target="_blank" rel="noreferrer">
            View the public case ↗
          </a>
        </p>
      )}

      <div className="thread-block">
        <div>
          <small>People involved</small>
          <div className="thread-list">
            {personIds.map((id) => {
              const p = personById(id, people)
              return (
                p && (
                  <a key={id} className="thread-item" href={href('people', { id, from: project.id })}>
                    <b>{p.initials}</b>
                    <span>
                      {p.name}
                      <small>
                        {p.role} · {p.office}
                      </small>
                    </span>
                    <ChevronRight size={14} />
                  </a>
                )
              )
            })}
          </div>
        </div>
        <div>
          <small>What this project holds</small>
          <p className="quiet">
            {byType('Learning').length} learnings · {byType('Decision').length} decisions · {byType('Experiment').length} experiments · {byType('Reflection').length} reflections
          </p>
        </div>
      </div>

      <div className="related">
        <small>Memories</small>
        <h2>What was learned here</h2>
        <div className="related-list">
          {owned.map((m) => (
            <a key={m.id} href={href('memory', { id: m.id, from: project.id })}>
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
