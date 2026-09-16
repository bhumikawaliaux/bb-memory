import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Command, Plus } from 'lucide-react'
import { DISCLAIMER, people as seedPeople, projects as seedProjects, seedMemories } from './data/catalog.js'
import { extractConcepts } from './search/concepts.js'
import { indexMemories, vectorFor, memoryText } from './search/embed.js'
import { retrieve } from './search/retrieve.js'
import { loadUserMemories, saveUserMemories } from './lib/storage.js'
import { go, href, parseHash } from './lib/route.js'
import Home from './views/Home.jsx'
import Results from './views/Results.jsx'
import Memory from './views/Memory.jsx'
import People from './views/People.jsx'
import Person from './views/Person.jsx'
import Projects from './views/Projects.jsx'
import Project from './views/Project.jsx'
import Contribute from './views/Contribute.jsx'

function useRoute() {
  const [route, setRoute] = useState(parseHash)
  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const [memories, setMemories] = useState(() => [...loadUserMemories(), ...seedMemories])
  const [q, setQ] = useState('')
  const [indexStatus, setIndexStatus] = useState('idle')
  const [interpreting, setInterpreting] = useState(false)
  const [result, setResult] = useState(null)
  const memoriesRef = useRef(memories)
  memoriesRef.current = memories
  const catalog = useMemo(() => ({ memories, people: seedPeople, projects: seedProjects }), [memories])

  useEffect(() => {
    let cancelled = false
    setIndexStatus('indexing')
    indexMemories(memories, () => {})
      .then(() => {
        if (!cancelled) setIndexStatus('ready')
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setIndexStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (route.view === 'home') {
      setResult(null)
      setInterpreting(false)
    }
    if (route.view !== 'search' || !route.q) return
    setQ(route.q)
    let cancelled = false
    setInterpreting(true)
    setResult({ query: route.q, concepts: extractConcepts(route.q), hits: null, mode: 'loading', intro: '' })
    const started = Date.now()
    retrieve(route.q, memoriesRef.current, { semantic: true })
      .then(async (next) => {
        const wait = Math.max(0, 520 - (Date.now() - started))
        await new Promise((r) => setTimeout(r, wait))
        if (!cancelled) setResult(next)
      })
      .catch(async (err) => {
        console.error(err)
        const next = await retrieve(route.q, memoriesRef.current, { semantic: false })
        if (!cancelled) setResult({ ...next, mode: 'fallback' })
      })
      .finally(() => {
        if (!cancelled) setInterpreting(false)
      })
    return () => {
      cancelled = true
    }
  }, [route.view, route.q])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        go('home')
        setTimeout(() => document.getElementById('memory-search')?.focus(), 40)
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        document.getElementById('memory-search')?.focus()
      }
      if (e.key === 'Escape' && route.view === 'search') go('home')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [route.view])

  function runSearch(query) {
    const text = (query ?? q).trim()
    if (!text) return go('home')
    go('search', { q: text })
  }

  function publish(memory) {
    const next = [memory, ...memories]
    setMemories(next)
    saveUserMemories(next.filter((m) => m.userCreated))
    vectorFor(memory.id, memoryText(memory)).catch(() => {})
  }

  const nav = [
    { view: 'home', label: 'Memory', active: ['home', 'search', 'memory'].includes(route.view) },
    { view: 'people', label: 'People', active: route.view === 'people' },
    { view: 'projects', label: 'Projects', active: route.view === 'projects' },
    { view: 'contribute', label: 'Contribute', active: route.view === 'contribute' },
  ]

  const memory = route.view === 'memory' ? memories.find((m) => m.id === route.id) : null
  const person = route.view === 'people' && route.id ? seedPeople.find((p) => p.id === route.id) : null
  const project = route.view === 'projects' && route.id ? seedProjects.find((p) => p.id === route.id) : null

  return (
    <div className="app">
      <aside>
        <a className="brand" href={href('home')}>
          <b>bb</b>
          <div>
            <strong>memory</strong>
            <small>collective knowledge</small>
          </div>
        </a>
        <nav>
          {nav.map((item) => (
            <a key={item.view} className={item.active ? 'active' : ''} href={href(item.view)}>
              {item.label}
              {item.view === 'home' && <span>{memories.length}</span>}
            </a>
          ))}
        </nav>
        <div className="bottom">
          <small>Prototype · 5 offices</small>
          <a className="add" href={href('contribute')}>
            <Plus size={15} /> Contribute
          </a>
        </div>
      </aside>
      <main>
        <header>
          <span>BB / MEMORY</span>
          <div>
            <button type="button" className="kbd" onClick={() => { go('home'); setTimeout(() => document.getElementById('memory-search')?.focus(), 40) }}>
              <Command size={12} /> K
            </button>
            <i aria-hidden="true">BW</i>
          </div>
        </header>
        <p className="banner">{DISCLAIMER}</p>

        {route.view === 'home' && <Home q={q} setQ={setQ} onSearch={runSearch} indexStatus={indexStatus} />}
        {route.view === 'search' && (
          <Results
            q={q}
            setQ={setQ}
            onSearch={runSearch}
            interpreting={interpreting}
            result={result}
            indexStatus={indexStatus}
            people={seedPeople}
            projects={seedProjects}
          />
        )}
        {route.view === 'memory' && memory && (
          <Memory memory={memory} memories={memories} people={seedPeople} projects={seedProjects} from={route.from} query={route.from === 'search' ? q : ''} />
        )}
        {route.view === 'memory' && !memory && <Missing label="That memory isn’t here." href={href('home')} />}
        {route.view === 'people' && !person && <People people={seedPeople} memories={memories} />}
        {route.view === 'people' && person && <Person person={person} memories={memories} projects={seedProjects} from={route.from} />}
        {route.view === 'projects' && !project && <Projects projects={seedProjects} memories={memories} />}
        {route.view === 'projects' && project && <Project project={project} memories={memories} people={seedPeople} from={route.from} />}
        {route.view === 'contribute' && <Contribute catalog={catalog} onPublish={publish} />}
      </main>
    </div>
  )
}

function Missing({ label, href: to }) {
  return (
    <section className="page">
      <h1>{label}</h1>
      <a className="text-link" href={to}>
        Back to memory
      </a>
    </section>
  )
}
