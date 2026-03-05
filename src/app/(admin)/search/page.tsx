import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, Table, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap'
import { useGlobalSearch } from '@/hooks/useSearch'
import SearchFilters from '@/components/search/SearchFilters'
import type { SearchFilters as SearchFiltersType } from '@/services/searchService'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { PageTitle } from '@/components/PageTitle'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFiltersType>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().substring(0, 80))
      if (query.trim()) {
        setSearchParams({ q: query.trim() })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading, error } = useGlobalSearch(debouncedQuery, filters)

  const totalResults = data
    ? data.dossiers.length + data.meetings.length + data.agendaItems.length + data.decisions.length + data.documents.length
    : 0

  return (
    <>
      <PageTitle title="Search" />
      <Row className="mb-3">
        <Col>
          <div className="position-relative">
            <input
              type="search"
              className="form-control form-control-lg"
              placeholder="Search governance entities..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <IconifyIcon icon="solar:magnifer-outline" className="position-absolute" style={{ right: 16, top: 14, fontSize: '1.2rem', opacity: 0.5 }} />
          </div>
        </Col>
      </Row>

      <SearchFilters filters={filters} onChange={setFilters} />

      {isLoading && (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">Search failed: {(error as Error).message}</Alert>}

      {data && debouncedQuery.length >= 2 && (
        <>
          <p className="text-muted mb-3">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "<strong>{debouncedQuery}</strong>"
          </p>

          {/* Dossiers */}
          {data.dossiers.length > 0 && (
            <Card className="mb-3">
              <Card.Header><Badge bg="primary" className="me-2">Dossiers</Badge> {data.dossiers.length} found</Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Dossier #</th>
                      <th>Title</th>
                      <th>Ministry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dossiers.map((d: any) => (
                      <tr key={d.id}>
                        <td><Link to={`/rvm/dossiers/${d.id}`}>{d.dossier_number}</Link></td>
                        <td className="text-truncate" style={{ maxWidth: 300 }}>{d.title}</td>
                        <td>{d.sender_ministry}</td>
                        <td><Badge bg="secondary">{d.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Meetings */}
          {data.meetings.length > 0 && (
            <Card className="mb-3">
              <Card.Header><Badge bg="info" className="me-2">Meetings</Badge> {data.meetings.length} found</Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.meetings.map((m: any) => (
                      <tr key={m.id}>
                        <td><Link to={`/rvm/meetings/${m.id}`}>{m.meeting_date}</Link></td>
                        <td><Badge bg="dark">{m.meeting_type}</Badge></td>
                        <td>{m.location || '—'}</td>
                        <td><Badge bg="secondary">{m.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Agenda Items */}
          {data.agendaItems.length > 0 && (
            <Card className="mb-3">
              <Card.Header><Badge bg="warning" className="me-2 text-dark">Agenda Items</Badge> {data.agendaItems.length} found</Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Title / Dossier</th>
                      <th>Meeting Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agendaItems.map((a: any) => (
                      <tr key={a.id}>
                        <td>{a.agenda_number}</td>
                        <td className="text-truncate" style={{ maxWidth: 300 }}>
                          <Link to={`/rvm/meetings/${a.meeting_id}`}>
                            {a.title_override || a.rvm_dossier?.title || '—'}
                          </Link>
                        </td>
                        <td>{a.rvm_meeting?.meeting_date || '—'}</td>
                        <td><Badge bg="secondary">{a.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Decisions */}
          {data.decisions.length > 0 && (
            <Card className="mb-3">
              <Card.Header><Badge bg="success" className="me-2">Decisions</Badge> {data.decisions.length} found</Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Decision Text</th>
                      <th>Status</th>
                      <th>Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.decisions.map((d: any) => (
                      <tr key={d.id}>
                        <td className="text-truncate" style={{ maxWidth: 400 }}>{d.decision_text}</td>
                        <td><Badge bg="secondary">{d.decision_status}</Badge></td>
                        <td>{d.is_final ? <Badge bg="danger">Final</Badge> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Documents */}
          {data.documents.length > 0 && (
            <Card className="mb-3">
              <Card.Header><Badge bg="secondary" className="me-2">Documents</Badge> {data.documents.length} found</Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Confidentiality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.documents.map((d: any) => (
                      <tr key={d.id}>
                        <td><Link to={`/rvm/dossiers/${d.dossier_id}`}>{d.title}</Link></td>
                        <td><Badge bg="dark">{d.doc_type}</Badge></td>
                        <td>{d.confidentiality_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {totalResults === 0 && (
            <Alert variant="info">No results found for "<strong>{debouncedQuery}</strong>". Try a different query or adjust filters.</Alert>
          )}
        </>
      )}
    </>
  )
}

export default SearchPage
