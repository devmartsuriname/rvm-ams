import { useState } from 'react'
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'
import type { Enums } from '@/integrations/supabase/types'
import type { Meeting } from '@/services/meetingService'

const meetingEditSchema = z.object({
  meeting_date: z.string().min(1, 'Meeting date is required'),
  meeting_type: z.enum(['regular', 'urgent', 'special'] as const).optional(),
  location: z.string().max(500).optional(),
})

type MeetingFormData = {
  meeting_date: string
  meeting_type: Enums<'meeting_type'>
  location: string
}

type Props = {
  meeting: Meeting
  onSave: (data: MeetingFormData) => void
  onCancel: () => void
  isLoading: boolean
}

export default function EditMeetingForm({ meeting, onSave, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<MeetingFormData>({
    meeting_date: meeting.meeting_date,
    meeting_type: meeting.meeting_type ?? 'regular',
    location: meeting.location ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const parsed = meetingEditSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }
    onSave(form)
  }

  return (
    <Row className="g-3">
      <Col md={12}>
        <Form.Group>
          <Form.Label>Meeting Date <span className="text-danger">*</span></Form.Label>
          <Form.Control type="date" value={form.meeting_date}
            onChange={e => { setForm(p => ({ ...p, meeting_date: e.target.value })); setErrors(p => ({ ...p, meeting_date: '' })) }}
            isInvalid={!!errors.meeting_date} disabled={isLoading} />
          {errors.meeting_date && <div className="invalid-feedback d-block">{errors.meeting_date}</div>}
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Meeting Type</Form.Label>
          <Form.Select value={form.meeting_type} onChange={e => setForm(p => ({ ...p, meeting_type: e.target.value as Enums<'meeting_type'> }))} disabled={isLoading}>
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
            onChange={e => setForm(p => ({ ...p, location: e.target.value }))} disabled={isLoading} />
        </Form.Group>
      </Col>
      <Col md={12} className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <><Spinner size="sm" className="me-1" /> Saving...</> : 'Save Changes'}
        </Button>
      </Col>
    </Row>
  )
}
