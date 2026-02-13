import { useState } from 'react'
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'
import type { Enums } from '@/integrations/supabase/types'
import type { DossierWithItem } from '@/services/dossierService'

const dossierEditSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500),
  service_type: z.enum(['proposal', 'missive'] as const),
  sender_ministry: z.string().trim().min(1, 'Sender ministry is required').max(200),
  urgency: z.enum(['regular', 'urgent', 'special'] as const).optional(),
  confidentiality_level: z.enum(['standard_confidential', 'restricted', 'highly_restricted'] as const).optional(),
  summary: z.string().max(5000).optional(),
  proposal_subtype: z.enum(['OPA', 'ORAG'] as const).optional().nullable(),
})

type DossierFormData = {
  title: string
  service_type: Enums<'service_type'>
  sender_ministry: string
  urgency: Enums<'urgency_level'>
  confidentiality_level: Enums<'confidentiality_level'>
  summary: string
  proposal_subtype: string
}

type Props = {
  dossier: DossierWithItem
  onSave: (data: DossierFormData) => void
  onCancel: () => void
  isLoading: boolean
}

export default function EditDossierForm({ dossier, onSave, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<DossierFormData>({
    title: dossier.title,
    service_type: dossier.service_type,
    sender_ministry: dossier.sender_ministry,
    urgency: dossier.urgency ?? 'regular',
    confidentiality_level: dossier.confidentiality_level ?? 'standard_confidential',
    summary: dossier.summary ?? '',
    proposal_subtype: dossier.proposal_subtype ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = () => {
    const parsed = dossierEditSchema.safeParse({
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

    onSave(form)
  }

  return (
    <Row className="g-3">
      <Col md={12}>
        <Form.Group>
          <Form.Label>Title <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text" value={form.title}
            onChange={e => setField('title', e.target.value)}
            isInvalid={!!errors.title} disabled={isLoading}
          />
          {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Service Type <span className="text-danger">*</span></Form.Label>
          <Form.Select value={form.service_type} onChange={e => setField('service_type', e.target.value)} disabled={isLoading}>
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
            isInvalid={!!errors.sender_ministry} disabled={isLoading}
          />
          {errors.sender_ministry && <div className="invalid-feedback d-block">{errors.sender_ministry}</div>}
        </Form.Group>
      </Col>
      {form.service_type === 'proposal' && (
        <Col md={6}>
          <Form.Group>
            <Form.Label>Proposal Subtype</Form.Label>
            <Form.Select value={form.proposal_subtype} onChange={e => setField('proposal_subtype', e.target.value)} disabled={isLoading}>
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
          <Form.Select value={form.urgency} onChange={e => setField('urgency', e.target.value)} disabled={isLoading}>
            <option value="regular">Regular</option>
            <option value="urgent">Urgent</option>
            <option value="special">Special</option>
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Confidentiality</Form.Label>
          <Form.Select value={form.confidentiality_level} onChange={e => setField('confidentiality_level', e.target.value)} disabled={isLoading}>
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
            onChange={e => setField('summary', e.target.value)} disabled={isLoading} />
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
