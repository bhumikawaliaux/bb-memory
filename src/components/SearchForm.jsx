import { ArrowUpRight, Search } from 'lucide-react'
import { exampleQueries } from '../data/catalog.js'

export default function SearchForm({ q, setQ, onSubmit, autoFocus, id = 'memory-search', examples = true }) {
  return (
    <>
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(q)
        }}
      >
        <Search aria-hidden="true" />
        <input
          id={id}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="I’m trying to make an AI product feel more trustworthy."
          autoFocus={autoFocus}
          autoComplete="off"
        />
        <button type="submit" aria-label="Search BB Memory">
          <ArrowUpRight />
        </button>
      </form>
      {examples && (
      <div className="try">
        <small>TRY ASKING</small>
        {exampleQueries.map((ex) => (
          <button
            type="button"
            key={ex}
            onClick={() => {
              setQ(ex)
              onSubmit(ex)
            }}
          >
            {ex}
          </button>
        ))}
      </div>
      )}
    </>
  )
}
