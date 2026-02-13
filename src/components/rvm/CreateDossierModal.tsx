import { useState } from 'react'
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'
import { useCreateDossier } from '@/hooks/useDossiers'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import type { Enums } from '@/integrations/supabase/types'

const dossierSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500),
  service_type: z.enum(['proposal', 'missive'] as const),
  sender_ministry: z.string().trim().min(1, 'Sender ministry is required').max(200),
  urgency: z.enum(['regular', 'urgent', 'special'] as const).optional(),
  confidentiality_level: z.enum(['standard_confidential', 'restricted', 'highly_restricted'] as const).optional(),
  summary: z.string().max(5000).optional(),
  proposal_subtype: z.enum(['OPA', 'ORAG'] as const).optional().nullable(),
  reference_code: z.string().max(100).optional(),
  received_date: z.string().optional(),
  description: z.string().max(5000).optional(),
  attachments_expected: z.boolean().optional(),
})

type Props = {
  show: boolean
  onHide: () => void
}

export default function CreateDossierModal({ show, onHide }: Props) {
  const { userId } = useUserRoles()
  const createDossier = useCreateDossier()

  const [form, setForm] = useState({
    title: '',
    service_type: 'proposal' as Enums<'service_type'>,
    sender_ministry: '',
    urgency: 'regular' as Enums<'urgency_level'>,
    confidentiality_level: 'standard_confidential' as Enums<'confidentiality_level'>,
    summary: '',
    proposal_subtype: '' as string,
    reference_code: '',
    received_date: '',
    description: '',
    attachments_expected: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setForm({
      title: '', service_type: 'proposal', sender_ministry: '',
      urgency: 'regular', confidentiality_level: 'standard_confidential',
      summary: '', proposal_subtype: '', reference_code: '',
      received_date: '', description: '', attachments_expected: false,
    })
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onHide()
  }

  const handleSubmit = async () => {
    const parsed = dossierSchema.safeParse({
      ...form,
      proposal_subtype: form.service_type === 'proposal' && form.proposal_subtype
        ? form.proposal_subtype : undefined,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach(e => {
        fieldErrors[e.path[0] as string] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      await createDossier.mutateAsync({
        dossier: {
          title: form.title,
          service_type: form.service_type,
          sender_ministry: form.sender_ministry,
          urgency: form.urgency,
          confidentiality_level: form.confidentiality_level,
          summary: form.summary || null,
          proposal_subtype: (form.service_type === 'proposal' && form.proposal_subtype
            ? form.proposal_subtype as Enums<'proposal_subtype'> : null),
          created_by: userId || null,
        },
        item: {
          reference_code: form.reference_code || null,
          received_date: form.received_date || null,
          description: form.description || null,
          attachments_expected: form.attachments_expected,
        },
      })
      toast.success('Dossier created successfully')
      handleClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const setField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Dossier</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text" value={form.title}
                onChange={e => setField('title', e.target.value)}
                isInvalid={!!errors.title}
              />
              {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Service Type <span className="text-danger">*</span></Form.Label>
              <Form.Select value={form.service_type} onChange={e => setField('service_type', e.target.value)}>
                <option value="proposal">Proposal</option>
                <option value="missive">Missive</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Sender Ministry <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text" value={form.sender_ministry}
                onChange={e => setField('sender_ministry', e.target.value)}
                isInvalid={!!errors.sender_ministry}
              />
              {errors.sender_ministry && <div className="invalid-feedback d-block">{errors.sender_ministry}</div>}
            </Form.Group>
          </Col>
          {form.service_type === 'proposal' && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>Proposal Subtype</Form.Label>
                <Form.Select value={form.proposal_subtype} onChange={e => setField('proposal_subtype', e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="OPA">OPA</option>
                  <option value="ORAG">ORAG</option>
                </Form.Select>
              </Form.Group>
            </Col>
          )}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Urgency</Form.Label>
              <Form.Select value={form.urgency} onChange={e => setField('urgency', e.target.value)}>
                <option value="regular">Regular</option>
                <option value="urgent">Urgent</option>
                <option value="special">Special</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Confidentiality</Form.Label>
              <Form.Select value={form.confidentiality_level} onChange={e => setField('confidentiality_level', e.target.value)}>
                <option value="standard_confidential">Standard Confidential</option>
                <option value="restricted">Restricted</option>
                <option value="highly_restricted">Highly Restricted</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Summary</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.summary}
                onChange={e => setField('summary', e.target.value)} />
            </Form.Group>
          </Col>

          <Col md={12}><hr /><h6 className="text-muted">Item Details</h6></Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Reference Code</Form.Label>
              <Form.Control type="text" value={form.reference_code}
                onChange={e => setField('reference_code', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Received Date</Form.Label>
              <Form.Control type="date" value={form.received_date}
                onChange={e => setField('received_date', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.description}
                onChange={e => setField('description', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Check
              type="checkbox" label="Attachments Expected"
              checked={form.attachments_expected}
              onChange={e => setField('attachments_expected', e.target.checked)}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={createDossier.isPending}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={createDossier.isPending}>
          {createDossier.isPending ? <><Spinner size="sm" className="me-1" /> Creating...</> : 'Create Dossier'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
