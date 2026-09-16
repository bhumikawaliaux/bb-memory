import { useState } from 'react'

export default function WhyRelevant({ why, relation, concepts, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="why-block">
      <button type="button" className="why-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>Why this might be relevant</span>
        <small>{relation}</small>
      </button>
      <p className="why-copy">{why}</p>
      {open && concepts?.length > 0 && (
        <div className="why-concepts">
          <small>Connected concepts</small>
          <div className="chips">
            {concepts.map((c) => (
              <em key={c}>{c}</em>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
