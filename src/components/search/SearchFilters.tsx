import { Card, Row, Col, Form, Button, Collapse } from 'react-bootstrap'
import { useState } from 'react'
import type { SearchFilters as SearchFiltersType } from '@/services/searchService'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface Props {
  filters: SearchFiltersType
  onChange: (filters: SearchFiltersType) => void
}

const SearchFilters = ({ filters, onChange }: Props) => {
  const [open, setOpen] = useState(false)

  const update = (key: keyof SearchFiltersType, value: string) => {
    onChange({ ...filters, [key]: value || undefined })
  }

  const clearAll = () => {
    onChange({})
  }

  const hasFilters = Object.values(filters).some(v => v)

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center justify-content-between py-2">
        <button className="btn btn-link text-decoration-none p-0" onClick={() => setOpen(!open)}>
          <IconifyIcon icon={open ? 'bx:chevron-up' : 'bx:chevron-down'} className="me-1" />
          Advanced Filters
          {hasFilters && <span className="badge bg-primary ms-2">Active</span>}
        </button>
        {hasFilters && (
          <Button variant="outline-secondary" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </Card.Header>
      <Collapse in={open}>
        <div>
          <Card.Body>
            <Row className="g-3">
              {/* Dossier Filters */}
              <Col md={3}>
                <h6 className="text-muted mb-2">Dossier</h6>
                <Form.Group className="mb-2">
                  <Form.Label className="small">Status</Form.Label>
                  <Form.Select size="sm" value={filters.dossierStatus || ''} onChange={e => update('dossierStatus', e.target.value)}>
                    <option value="">All</option>
                    <option value="draft">Draft</option>
                    <option value="registered">Registered</option>
                    <option value="in_preparation">In Preparation</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="decided">Decided</option>
                    <option value="archived">Archived</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small">Ministry</Form.Label>
                  <Form.Control size="sm" placeholder="Filter ministry..." value={filters.dossierMinistry || ''} onChange={e => update('dossierMinistry', e.target.value)} />
                </Form.Group>
              </Col>

              {/* Meeting Filters */}
              <Col md={3}>
                <h6 className="text-muted mb-2">Meeting</h6>
                <Form.Group className="mb-2">
                  <Form.Label className="small">Type</Form.Label>
                  <Form.Select size="sm" value={filters.meetingType || ''} onChange={e => update('meetingType', e.target.value)}>
                    <option value="">All</option>
                    <option value="regular">Regular</option>
                    <option value="urgent">Urgent</option>
                    <option value="special">Special</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label className="small">Status</Form.Label>
                  <Form.Select size="sm" value={filters.meetingStatus || ''} onChange={e => update('meetingStatus', e.target.value)}>
                    <option value="">All</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label className="small">Date From</Form.Label>
                  <Form.Control size="sm" type="date" value={filters.meetingDateFrom || ''} onChange={e => update('meetingDateFrom', e.target.value)} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small">Date To</Form.Label>
                  <Form.Control size="sm" type="date" value={filters.meetingDateTo || ''} onChange={e => update('meetingDateTo', e.target.value)} />
                </Form.Group>
              </Col>

              {/* Decision Filters */}
              <Col md={3}>
                <h6 className="text-muted mb-2">Decision</h6>
                <Form.Group>
                  <Form.Label className="small">Status</Form.Label>
                  <Form.Select size="sm" value={filters.decisionStatus || ''} onChange={e => update('decisionStatus', e.target.value)}>
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="deferred">Deferred</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Agenda Filters */}
              <Col md={3}>
                <h6 className="text-muted mb-2">Agenda Item</h6>
                <Form.Group>
                  <Form.Label className="small">Status</Form.Label>
                  <Form.Select size="sm" value={filters.agendaStatus || ''} onChange={e => update('agendaStatus', e.target.value)}>
                    <option value="">All</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="presented">Presented</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="moved">Moved</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  )
}

export default SearchFilters
