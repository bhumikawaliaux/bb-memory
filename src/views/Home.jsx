import SearchForm from '../components/SearchForm.jsx'

export default function Home({ q, setQ, onSearch, indexStatus }) {
  return (
    <section className="home">
      <div className="hero">
        <label>Your studio’s collective memory</label>
        <h1>
          What are you
          <br />
          <i>trying to figure out?</i>
        </h1>
        <p>
          Describe a problem in your own words. BB Memory looks for what the studio has
          already learned — and who to talk to.
        </p>
        <SearchForm q={q} setQ={setQ} onSubmit={onSearch} autoFocus />
        <p className="index-hint" aria-live="polite">
          {indexStatus === 'indexing' && 'Preparing semantic search in your browser…'}
          {indexStatus === 'ready' && 'Search understands meaning, not just matching words.'}
          {indexStatus === 'error' && 'Semantic model unavailable — keyword search will be used.'}
        </p>
      </div>
    </section>
  )
}
