import React, { useState, useRef, useMemo } from 'react'
import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Table, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAllDecisions } from '@/hooks/useDecisions'
import { DecisionLifecycleBadge } from '@/components/rvm/StatusBadges'
import { EmptyState, LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import DecisionReport from '@/components/rvm/DecisionReport'
import type { Enums } from '@/integrations/supabase/types'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { formatDate } from '@/utils/date'

type DecisionStatus = Enums<'decision_status'>
type SortField = 'agenda_number' | 'created_at' | 'decision_status' | 'meeting_date'
type SortDir = 'asc' | 'desc'

const DecisionListPage = () => {
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | ''>('')
  const [meetingFilter, setMeetingFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showReport, setShowReport] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const { data: decisions, isLoading, error, refetch } = useAllDecisions()

  // Extract unique meetings for filter dropdown
  const meetingOptions = useMemo(() => {
    if (!decisions) return []
    const map = new Map<string, { id: string; date: string }>()
    decisions.forEach((d) => {
      const ai = d.rvm_agenda_item as any
      const meeting = ai?.rvm_meeting as { id: string; meeting_date: string } | null
      if (meeting?.id && !map.has(meeting.id)) {
        map.set(meeting.id, { id: meeting.id, date: meeting.meeting_date })
      }
    })
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date))
  }, [decisions])

  const filtered = useMemo(() => {
    if (!decisions) return []
    return decisions.filter((d) => {
      if (statusFilter && d.decision_status !== statusFilter) return false
      if (meetingFilter) {
        const ai = d.rvm_agenda_item as any
        const meeting = ai?.rvm_meeting as { id: string } | null
        if (meeting?.id !== meetingFilter) return false
      }
      return true
    })
  }, [decisions, statusFilter, meetingFilter])

  const sorted = useMemo(() => {
    if (!filtered) return []
    return [...filtered].sort((a, b) => {
      let cmp = 0
      const aiA = a.rvm_agenda_item as any
      const aiB = b.rvm_agenda_item as any
      switch (sortField) {
        case 'agenda_number':
          cmp = (aiA?.agenda_number ?? 0) - (aiB?.agenda_number ?? 0)
          break
        case 'created_at':
          cmp = (a.created_at ?? '').localeCompare(b.created_at ?? '')
          break
        case 'decision_status':
          cmp = (a.decision_status ?? '').localeCompare(b.decision_status ?? '')
          break
        case 'meeting_date': {
          const mA = (aiA?.rvm_meeting as any)?.meeting_date ?? ''
          const mB = (aiB?.rvm_meeting as any)?.meeting_date ?? ''
          cmp = mA.localeCompare(mB)
          break
        }
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <IconifyIcon icon="bx:sort" className="ms-1 opacity-50" />
    return sortDir === 'asc'
      ? <IconifyIcon icon="bx:sort-up" className="ms-1" />
      : <IconifyIcon icon="bx:sort-down" className="ms-1" />
  }


  const handlePrint = () => {
    setShowReport(true)
    setTimeout(() => {
      window.print()
      setShowReport(false)
    }, 200)
  }

  return (
    <>
      <PageTitle subName="RVM Core" title="Decisions" />

      {/* Filters */}
      <Card className="mb-3">
        <CardBody>
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Label className="small mb-1">Status</Form.Label>
              <Form.Select
                size="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DecisionStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="deferred">Deferred</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small mb-1">Meeting</Form.Label>
              <Form.Select
                size="sm"
                value={meetingFilter}
                onChange={(e) => setMeetingFilter(e.target.value)}
              >
                <option value="">All Meetings</option>
                {meetingOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {formatDate(m.date)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100"
                onClick={() => { setStatusFilter(''); setMeetingFilter('') }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingState message="Loading decisions..." />
      ) : error ? (
        <ErrorState message="Failed to load decisions" onRetry={() => refetch()} />
      ) : !sorted || sorted.length === 0 ? (
        <EmptyState
          icon="bx:check-circle"
          title="No Decisions Found"
          description="No decisions match your current filters."
        />
      ) : (
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Decision Register ({sorted.length})</h5>
            <Button variant="outline-primary" size="sm" onClick={handlePrint}>
              <IconifyIcon icon="bx:printer" className="me-1" />
              Print Register
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th
                    style={{ width: '50px', cursor: 'pointer' }}
                    onClick={() => handleSort('agenda_number')}
                  >
                    # {sortIcon('agenda_number')}
                  </th>
                  <th>Decision</th>
                  <th>Dossier</th>
                  <th>Responsible Unit</th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('meeting_date')}
                  >
                    Meeting {sortIcon('meeting_date')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('decision_status')}
                  >
                    Status {sortIcon('decision_status')}
                  </th>
                  <th>Final</th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('created_at')}
                  >
                    Date {sortIcon('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((decision) => {
                  const agendaItem = decision.rvm_agenda_item as any
                  const dossier = agendaItem?.rvm_dossier as { id: string; dossier_number: string; title: string; sender_ministry?: string } | null
                  const meeting = agendaItem?.rvm_meeting as { id: string; meeting_date: string } | null

                  return (
                    <tr key={decision.id}>
                      <td className="fw-medium">{agendaItem?.agenda_number ?? '-'}</td>
                      <td className="text-truncate" style={{ maxWidth: '250px' }}>
                        {decision.decision_text}
                      </td>
                      <td>
                        {dossier ? (
                          <Link to={`/rvm/dossiers/${dossier.id}`} className="text-primary">
                            {dossier.dossier_number}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="small">{dossier?.sender_ministry || '-'}</td>
                      <td>
                        {meeting ? (
                          <Link to={`/rvm/meetings/${meeting.id}`} className="text-primary">
                            {formatDate(meeting.meeting_date)}
                          </Link>
                        ) : '-'}
                      </td>
                      <td>
                        <DecisionLifecycleBadge status={decision.decision_status} isFinal={decision.is_final} />
                      </td>
                      <td>
                        {decision.is_final ? (
                          <Badge bg="dark" className="small">Final</Badge>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="small">{formatDate(decision.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Print-only report */}
      {showReport && sorted && (
        <div className="d-none d-print-block">
          <DecisionReport
            ref={reportRef}
            decisions={sorted as any}
            title="Decision Register"
          />
        </div>
      )}

      <Footer />
    </>
  )
}

export default DecisionListPage
