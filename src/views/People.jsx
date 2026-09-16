import { ChevronRight } from 'lucide-react'
import { href } from '../lib/route.js'
import { memoriesForPerson } from '../data/catalog.js'

export default function People({ people, memories }) {
  return (
    <section className="page">
      <div className="title">
        <div>
          <small>Who should I talk to?</small>
          <h1>People</h1>
          <p>Expertise, not a directory. Each person is a route into memories.</p>
        </div>
      </div>
      <div className="people">
        {people.map((p) => {
          const owned = memoriesForPerson(p.id, memories)
          return (
            <a key={p.id} className="person-card" href={href('people', { id: p.id })}>
              <div className="phead">
                <b>{p.initials}</b>
                <small>{p.office}</small>
              </div>
              <h3>{p.name}</h3>
              <p>{p.role}</p>
              <small>Ask me about {p.askAbout.slice(0, 2).join(', ')}</small>
              <footer>
                {owned.length} {owned.length === 1 ? 'memory' : 'memories'} <ChevronRight size={13} />
              </footer>
            </a>
          )
        })}
      </div>
    </section>
  )
}
