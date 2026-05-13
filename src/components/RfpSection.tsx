import { useMemo, useState } from 'react'
import { rfpCategories, rfpEntries, type RfpEntry } from '../data/rfp'

type Filter = 'all' | RfpEntry['category']

export function RfpSection() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rfpEntries.filter((entry) => {
      if (filter !== 'all' && entry.category !== filter) return false
      if (q.length === 0) return true
      return (
        entry.question.toLowerCase().includes(q) ||
        entry.answer.toLowerCase().includes(q) ||
        entry.references.some((r) => r.label.toLowerCase().includes(q))
      )
    })
  }, [query, filter])

  return (
    <div className="rfp-section">
      <header className="rfp-header">
        <span className="kicker">RFI / RFP companion · Preview</span>
        <h2>Quick answers for sales and pre-sales conversations</h2>
        <p>
          A curated answer bank for RFI / RFP responses across Azure Local and Hyper-V on Windows Server. Search, filter by topic, and link to the source documentation. This module is in preview while we expand coverage.
        </p>
      </header>

      <div className="rfp-controls">
        <input
          aria-label="Search questions"
          className="rfp-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions, answers, or references..."
          type="search"
          value={query}
        />
        <div className="rfp-filters">
          <button
            className={filter === 'all' ? 'rfp-filter active' : 'rfp-filter'}
            onClick={() => setFilter('all')}
            type="button"
          >
            All ({rfpEntries.length})
          </button>
          {rfpCategories.map((cat) => {
            const count = rfpEntries.filter((e) => e.category === cat.id).length
            return (
              <button
                className={filter === cat.id ? 'rfp-filter active' : 'rfp-filter'}
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                type="button"
              >
                {cat.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rfp-empty">No matching answers — try a different search or category.</p>
      ) : (
        <ol className="rfp-list">
          {filtered.map((entry) => {
            const isOpen = expanded === entry.id
            return (
              <li
                className={isOpen ? 'rfp-item open' : 'rfp-item'}
                key={entry.id}
              >
                <button
                  className="rfp-question"
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  type="button"
                >
                  <span className="rfp-cat">
                    {rfpCategories.find((c) => c.id === entry.category)?.label}
                  </span>
                  <span className="rfp-q-text">{entry.question}</span>
                  <span className="rfp-toggle" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen ? (
                  <div className="rfp-answer">
                    <p>{entry.answer}</p>
                    <div className="rec-links">
                      {entry.references.map((r) => (
                        <a href={r.url} key={r.url} rel="noreferrer" target="_blank">
                          {r.label} →
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>
      )}

      <p className="rfp-footnote">
        Want a question added? <a href="https://github.com/Azure-hacker/migration-decision-assistant/issues/new?title=RFP+question+request" rel="noreferrer" target="_blank">Open an issue</a>.
      </p>
    </div>
  )
}
