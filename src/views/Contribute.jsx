import { useMemo, useState } from 'react'
import { href } from '../lib/route.js'
import { extractConcepts } from '../search/concepts.js'
import { suggestMetadata } from '../search/suggest.js'

const empty = { learned: '', workingOn: '', shouldKnow: '' }

export default function Contribute({ catalog, onPublish }) {
  const [draft, setDraft] = useState(empty)
  const [review, setReview] = useState(null)
  const [published, setPublished] = useState(null)

  const canSuggest = draft.learned.trim().length > 12 && draft.shouldKnow.trim().length > 8

  const suggest = () => {
    const meta = suggestMetadata(draft, catalog)
    setReview({
      ...meta,
      office: 'London',
      learned: draft.learned,
      workingOn: draft.workingOn,
      shouldKnow: draft.shouldKnow,
    })
  }

  const publish = () => {
    const memory = {
      id: 'u' + Date.now(),
      title: review.title.trim(),
      type: review.type,
      office: review.office,
      year: String(new Date().getFullYear()),
      discipline: 'Product',
      concepts: review.concepts,
      summary: review.summary || review.shouldKnow,
      context: review.workingOn,
      tried: 'Captured directly in BB Memory.',
      finding: review.learned,
      decision: review.shouldKnow,
      looking: '',
      matter: review.shouldKnow,
      people: [],
      projectId: review.relatedProjects[0]?.id || '',
      related: review.relatedMemories.map((m) => m.id),
      provenance: {
        kind: 'Prototype memory',
        publicFact: 'Captured in this prototype. Not an internal BB record.',
        url: '',
      },
      userCreated: true,
    }
    onPublish(memory)
    setPublished(memory)
  }

  const liveConcepts = useMemo(() => extractConcepts(`${draft.learned} ${draft.shouldKnow}`), [draft])

  if (published) {
    return (
      <section className="page contribute">
        <small className="kicker">Published</small>
        <h1>Your memory is now part of BB Memory.</h1>
        <p className="summary">It can be discovered by semantic search. Follow a thread, or capture another.</p>
        <div className="related-list">
          <a href={href('memory', { id: published.id })}>
            <span>{published.type}</span>
            <strong>{published.title}</strong>
          </a>
          {published.related.slice(0, 3).map((id) => {
            const m = catalog.memories.find((x) => x.id === id)
            return (
              m && (
                <a key={id} href={href('memory', { id })}>
                  <span>Related</span>
                  <strong>{m.title}</strong>
                </a>
              )
            )
          })}
        </div>
        <button
          className="primary"
          onClick={() => {
            setPublished(null)
            setReview(null)
            setDraft(empty)
          }}
        >
          Add another memory
        </button>
      </section>
    )
  }

  if (review) {
    return (
      <section className="page contribute">
        <small className="kicker">AI suggestions — review before publishing</small>
        <h1>Does this still sound like what you learned?</h1>
        <p className="honest-note">These suggestions are derived from your words and related memories. They are not published until you say so.</p>
        <label>
          Title
          <input value={review.title} onChange={(e) => setReview({ ...review, title: e.target.value })} />
        </label>
        <label>
          Summary
          <textarea value={review.summary} onChange={(e) => setReview({ ...review, summary: e.target.value })} />
        </label>
        <div className="twocol">
          <label>
            Memory type
            <select value={review.type} onChange={(e) => setReview({ ...review, type: e.target.value })}>
              <option>Learning</option>
              <option>Decision</option>
              <option>Experiment</option>
              <option>Reflection</option>
            </select>
          </label>
          <label>
            Office
            <select value={review.office} onChange={(e) => setReview({ ...review, office: e.target.value })}>
              {['Amsterdam', 'Barcelona', 'Bonn', 'London', 'Oslo'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="quiet">Topics: {review.concepts.join(', ') || 'None detected yet'}</p>
        {review.relatedMemories.length > 0 && (
          <p className="quiet">Related memories: {review.relatedMemories.map((m) => m.title).join(' · ')}</p>
        )}
        <div className="modalfoot">
          <button type="button" onClick={() => setReview(null)}>
            Back
          </button>
          <button className="primary" onClick={publish}>
            Publish memory
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="page contribute">
      <small className="kicker">Under two minutes</small>
      <h1>What did you learn?</h1>
      <p className="summary">Keep it lightweight. The useful part is the context someone else will need later.</p>
      <label>
        What did you learn?
        <textarea
          value={draft.learned}
          onChange={(e) => setDraft({ ...draft, learned: e.target.value })}
          placeholder="A progressive disclosure model performed better than showing every AI capability at once."
        />
      </label>
      <label>
        What were you working on?
        <textarea
          value={draft.workingOn}
          onChange={(e) => setDraft({ ...draft, workingOn: e.target.value })}
          placeholder="An onboarding flow for an AI product."
        />
      </label>
      <label>
        What should someone else know?
        <textarea
          value={draft.shouldKnow}
          onChange={(e) => setDraft({ ...draft, shouldKnow: e.target.value })}
          placeholder="Don’t use the first screen to prove how much the system can do."
        />
      </label>
      {liveConcepts.length > 0 && (
        <p className="quiet">Related concepts: {liveConcepts.join(', ')}</p>
      )}
      <button className="primary" disabled={!canSuggest} onClick={suggest}>
        Review AI suggestions
      </button>
    </section>
  )
}
