import { useState, useCallback } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import { useCreateDocument } from '@/hooks/useDocuments'
import { useUserRoles } from '@/hooks/useUserRoles'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/utils/rls-error'
import type { Enums } from '@/integrations/supabase/types'

const DOC_TYPES: { value: Enums<'document_type'>; label: string }[] = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'missive', label: 'Missive' },
  { value: 'attachment', label: 'Attachment' },
  { value: 'decision_list', label: 'Decision List' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'other', label: 'Other' },
]

const CONF_LEVELS: { value: Enums<'confidentiality_level'>; label: string }[] = [
  { value: 'standard_confidential', label: 'Standard Confidential' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'highly_restricted', label: 'Highly Restricted' },
]

type Props = {
  show: boolean
  onHide: () => void
  dossierId: string
  decisions?: { id: string; decision_text: string }[]
  agendaItems?: { id: string; title_override?: string | null; agenda_number: number }[]
}

const UploadDocumentModal = ({ show, onHide, dossierId, decisions = [], agendaItems = [] }: Props) => {
  const { userId } = useUserRoles()
  const createDoc = useCreateDocument()

  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState<Enums<'document_type'>>('attachment')
  const [confLevel, setConfLevel] = useState<Enums<'confidentiality_level'>>('standard_confidential')
  const [decisionId, setDecisionId] = useState('')
  const [agendaItemId, setAgendaItemId] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 20 * 1024 * 1024, // 20MB
  })

  const reset = () => {
    setTitle('')
    setDocType('attachment')
    setConfLevel('standard_confidential')
    setDecisionId('')
    setAgendaItemId('')
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return

    try {
      await createDoc.mutateAsync({
        dossierId,
        title: title.trim(),
        docType,
        confidentialityLevel: confLevel,
        file,
        decisionId: decisionId || null,
        agendaItemId: agendaItemId || null,
        createdBy: userId ?? null,
      })
      toast.success('Document uploaded successfully')
      reset()
      onHide()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Document</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Document title"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Document Type</Form.Label>
                <Form.Select value={docType} onChange={(e) => setDocType(e.target.value as Enums<'document_type'>)}>
                  {DOC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Confidentiality Level</Form.Label>
                <Form.Select value={confLevel} onChange={(e) => setConfLevel(e.target.value as Enums<'confidentiality_level'>)}>
                  {CONF_LEVELS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {decisions.length > 0 && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Link to Decision (optional)</Form.Label>
                  <Form.Select value={decisionId} onChange={(e) => setDecisionId(e.target.value)}>
                    <option value="">— None —</option>
                    {decisions.map((d) => (
                      <option key={d.id} value={d.id}>{d.decision_text.substring(0, 80)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label>File <span className="text-danger">*</span></Form.Label>
              <div
                {...getRootProps()}
                className={`border border-2 border-dashed rounded p-4 text-center ${isDragActive ? 'border-primary bg-light' : 'border-secondary'}`}
                style={{ cursor: 'pointer' }}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <p className="mb-1 fw-medium">{file.name}</p>
                    <small className="text-muted">{formatSize(file.size)}</small>
                    <br />
                    <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="mb-0 text-muted">
                    {isDragActive ? 'Drop file here...' : 'Drag & drop a file here, or click to browse'}
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!file || !title.trim() || createDoc.isPending}
          >
            {createDoc.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default UploadDocumentModal
