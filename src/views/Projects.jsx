import { ChevronRight } from 'lucide-react'
import { href } from '../lib/route.js'
import { memoriesForProject } from '../data/catalog.js'

export default function Projects({ projects, memories }) {
  return (
    <section className="page">
      <div className="title">
        <div>
          <small>Context for the memories</small>
          <h1>Projects</h1>
          <p>Public BB work as environments. The memories attached to them are prototype fiction.</p>
        </div>
      </div>
      <div className="projects">
        {projects.map((p) => {
          const n = memoriesForProject(p.id, memories).length
          return (
          <a key={p.id} className="project-card" href={href('projects', { id: p.id })}>
            <small>{p.office}</small>
            <div>
              <label>
                {p.kind} · {p.public ? 'Public project' : 'Prototype'}
              </label>
              <h3>{p.name}</h3>
              <p>{p.disciplines}</p>
              <footer>
                {n} {n === 1 ? 'memory' : 'memories'} <ChevronRight size={13} />
              </footer>
            </div>
          </a>
          )
        })}
      </div>
    </section>
  )
}
