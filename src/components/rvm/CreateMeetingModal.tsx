import { useState } from 'react'
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'
import { useCreateMeeting } from '@/hooks/useMeetings'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import type { Enums } from '@/integrations/supabase/types'

const meetingSchema = z.object({
  meeting_date: z.string().min(1, 'Meeting date is required'),
  meeting_type: z.enum(['regular', 'urgent', 'special'] as const).optional(),
  location: z.string().max(500).optional(),
})

type Props = { show: boolean; onHide: () => void }

export default function CreateMeetingModal({ show, onHide }: Props) {
  const { userId } = useUserRoles()
  const createMeeting = useCreateMeeting()

  const [form, setForm] = useState({
    meeting_date: '',
    meeting_type: 'regular' as Enums<'meeting_type'>,
    location: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setForm({ meeting_date: '', meeting_type: 'regular', location: '' })
    setErrors({})
  }

  const handleClose = () => { resetForm(); onHide() }

  const handleSubmit = async () => {
    const parsed = meetingSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }

    try {
      await createMeeting.mutateAsync({
        meeting_date: form.meeting_date,
        meeting_type: form.meeting_type,
        location: form.location || null,
        created_by: userId || null,
      })
      toast.success('Meeting created successfully')
      handleClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Meeting</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Meeting Date <span className="text-danger">*</span></Form.Label>
              <Form.Control type="date" value={form.meeting_date}
                onChange={e => { setForm(p => ({ ...p, meeting_date: e.target.value })); setErrors(p => ({ ...p, meeting_date: '' })) }}
                isInvalid={!!errors.meeting_date} />
              {errors.meeting_date && <div className="invalid-feedback d-block">{errors.meeting_date}</div>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Meeting Type</Form.Label>
              <Form.Select value={form.meeting_type} onChange={e => setForm(p => ({ ...p, meeting_type: e.target.value as Enums<'meeting_type'> }))}>
                <option value="regular">Regular</option>
                <option value="urgent">Urgent</option>
                <option value="special">Special</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={createMeeting.isPending}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={createMeeting.isPending}>
          {createMeeting.isPending ? <><Spinner size="sm" className="me-1" /> Creating...</> : 'Create Meeting'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
