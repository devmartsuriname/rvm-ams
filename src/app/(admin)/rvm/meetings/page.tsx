import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Table, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useMeetings } from '@/hooks/useMeetings'
import { MeetingStatusBadge } from '@/components/rvm/StatusBadges'
import { EmptyState, LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import { useState } from 'react'
import type { Enums } from '@/integrations/supabase/types'
import { useUserRoles } from '@/hooks/useUserRoles'
import CreateMeetingModal from '@/components/rvm/CreateMeetingModal'

type MeetingStatus = Enums<'meeting_status'>

const MeetingListPage = () => {
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | ''>('')
  const [showCreate, setShowCreate] = useState(false)
  const { canCreateMeeting } = useUserRoles()

  const { data: meetings, isLoading, error, refetch } = useMeetings({
    status: statusFilter || undefined,
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('nl-NL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getMeetingTypeLabel = (type: string | null) => {
    switch (type) {
      case 'regular': return 'Regular'
      case 'urgent': return 'Urgent'
      case 'special': return 'Special'
      default: return type || '-'
    }
  }

  return (
    <>
      <PageTitle subName="RVM Core" title="Meetings" />
      
      {/* Filters */}
      <Card className="mb-3">
        <CardBody>
          <Row className="g-2">
            <Col md={4}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as MeetingStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => setStatusFilter('')}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingState message="Loading meetings..." />
      ) : error ? (
        <ErrorState message="Failed to load meetings" onRetry={() => refetch()} />
      ) : !meetings || meetings.length === 0 ? (
        <EmptyState 
          icon="bx:calendar-x" 
          title="No Meetings Found" 
          description="No meetings match your current filters."
        />
      ) : (
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Meetings ({meetings.length})</h5>
            {canCreateMeeting && (
              <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                + New Meeting
              </Button>
            )}
          </CardHeader>
          <CardBody className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td>
                      <Link to={`/rvm/meetings/${meeting.id}`} className="text-primary">
                        {formatDate(meeting.meeting_date)}
                      </Link>
                    </td>
                    <td>
                      <Badge bg={meeting.meeting_type === 'urgent' ? 'warning' : meeting.meeting_type === 'special' ? 'danger' : 'secondary'}>
                        {getMeetingTypeLabel(meeting.meeting_type)}
                      </Badge>
                    </td>
                    <td>{meeting.location || '-'}</td>
                    <td><MeetingStatusBadge status={meeting.status} /></td>
                    <td className="text-end">
                      <Link 
                        to={`/rvm/meetings/${meeting.id}`} 
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {canCreateMeeting && (
        <CreateMeetingModal show={showCreate} onHide={() => setShowCreate(false)} />
      )}

      <Footer />
    </>
  )
}

export default MeetingListPage
