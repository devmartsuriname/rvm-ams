import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useGlobalSearch } from '@/hooks/useSearch'
import { Badge, Spinner } from 'react-bootstrap'

const MAX_PER_GROUP = 3

const GlobalSearch = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().substring(0, 80))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useGlobalSearch(debouncedQuery)

  // Open dropdown when results arrive
  useEffect(() => {
    if (data && debouncedQuery.length >= 2) {
      const hasResults = data.dossiers.length || data.meetings.length || data.agendaItems.length || data.decisions.length || data.documents.length
      setOpen(!!hasResults)
    }
  }, [data, debouncedQuery])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' && debouncedQuery.length >= 2) {
      e.preventDefault()
      setOpen(false)
      navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`)
    }
  }, [debouncedQuery, navigate])

  const navigateTo = (path: string) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  const renderGroup = (label: string, variant: string, items: any[], linkFn: (item: any) => string, titleFn: (item: any) => string) => {
    if (!items.length) return null
    return (
      <div className="mb-2">
        <div className="px-3 py-1">
          <Badge bg={variant} className="text-uppercase" style={{ fontSize: '0.65rem' }}>{label}</Badge>
        </div>
        {items.slice(0, MAX_PER_GROUP).map((item, i) => (
          <button
            key={i}
            className="dropdown-item px-3 py-1 text-truncate d-block w-100 text-start border-0 bg-transparent"
            style={{ cursor: 'pointer', fontSize: '0.85rem' }}
            onClick={() => navigateTo(linkFn(item))}
          >
            {titleFn(item)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="app-search d-none d-md-block me-auto position-relative">
      <div className="position-relative">
        <input
          type="search"
          className="form-control"
          placeholder="Search governance..."
          autoComplete="off"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (data && debouncedQuery.length >= 2) setOpen(true) }}
        />
        <IconifyIcon icon="solar:magnifer-outline" className="search-widget-icon" />
        {isLoading && debouncedQuery.length >= 2 && (
          <Spinner animation="border" size="sm" className="position-absolute" style={{ right: 10, top: 10 }} />
        )}
      </div>

      {open && data && (
        <div
          className="position-absolute bg-white shadow rounded-2 border mt-1"
          style={{ width: '100%', minWidth: 320, maxHeight: 420, overflowY: 'auto', zIndex: 1050 }}
        >
          {renderGroup('Dossiers', 'primary', data.dossiers, d => `/rvm/dossiers/${d.id}`, d => `${d.dossier_number} — ${d.title}`)}
          {renderGroup('Meetings', 'info', data.meetings, m => `/rvm/meetings/${m.id}`, m => `${m.meeting_date} — ${m.meeting_type} (${m.location || 'No location'})`)}
          {renderGroup('Agenda Items', 'warning', data.agendaItems, a => `/rvm/meetings/${a.meeting_id}`, a => `#${a.agenda_number} — ${a.title_override || (a as any).rvm_dossier?.title || 'Agenda Item'}`)}
          {renderGroup('Decisions', 'success', data.decisions, d => `/rvm/decisions`, d => d.decision_text?.substring(0, 80) || 'Decision')}
          {renderGroup('Documents', 'secondary', data.documents, d => `/rvm/dossiers/${d.dossier_id}`, d => `${d.title} (${d.doc_type})`)}

          <div className="border-top px-3 py-2 text-center">
            <button
              className="btn btn-sm btn-outline-primary w-100"
              onClick={() => navigateTo(`/search?q=${encodeURIComponent(debouncedQuery)}`)}
            >
              View all results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
