import { useState } from 'react'
import { Card, CardBody, CardHeader, Table, Button } from 'react-bootstrap'
import { useDocumentsByDossier } from '@/hooks/useDocuments'
import { useUserRoles } from '@/hooks/useUserRoles'
import { ConfidentialityBadge } from '@/components/rvm/StatusBadges'
import { LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import UploadDocumentModal from '@/components/rvm/UploadDocumentModal'
import DocumentVersionModal from '@/components/rvm/DocumentVersionModal'
import { documentService } from '@/services/documentService'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/utils/rls-error'
import type { DocumentWithVersion } from '@/services/documentService'

const DOC_TYPE_LABELS: Record<string, string> = {
  proposal: 'Proposal',
  missive: 'Missive',
  attachment: 'Attachment',
  decision_list: 'Decision List',
  minutes: 'Minutes',
  other: 'Other',
}

type Props = {
  dossierId: string
  decisions?: { id: string; decision_text: string }[]
}

const DossierDocumentsTab = ({ dossierId, decisions = [] }: Props) => {
  const { canUploadDocument } = useUserRoles()
  const { data: documents, isLoading, error, refetch } = useDocumentsByDossier(dossierId)
  const decisionMap = new Map(decisions.map((d) => [d.id, d.decision_text]))

  const [showUpload, setShowUpload] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithVersion | null>(null)

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'

  const handleDownload = async (doc: DocumentWithVersion) => {
    if (!doc.current_version) return
    try {
      const url = await documentService.getDownloadUrl((doc.current_version as any).storage_path)
      const a = document.createElement('a')
      a.href = url
      a.download = (doc.current_version as any).file_name
      a.click()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading) return <LoadingState message="Loading documents..." />
  if (error) return <ErrorState message="Failed to load documents" onRetry={() => refetch()} />

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Documents</h5>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary">{documents?.length ?? 0}</span>
            {canUploadDocument && (
              <Button variant="primary" size="sm" onClick={() => setShowUpload(true)}>
                Upload Document
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {!documents || documents.length === 0 ? (
            <div className="text-center text-muted py-4">
              <p className="mb-0">No documents uploaded yet</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Confidentiality</th>
                  <th>Version</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDoc(doc)}>
                    <td className="fw-medium">{doc.title}</td>
                    <td>{DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}</td>
                    <td><ConfidentialityBadge level={doc.confidentiality_level} /></td>
                    <td>v{(doc.current_version as any)?.version_number ?? '—'}</td>
                    <td>{(doc.creator as any)?.full_name ?? '-'}</td>
                    <td>{formatDate(doc.created_at)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc) }}
                        disabled={!doc.current_version}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <UploadDocumentModal
        show={showUpload}
        onHide={() => setShowUpload(false)}
        dossierId={dossierId}
        decisions={decisions}
      />

      {selectedDoc && (
        <DocumentVersionModal
          show={!!selectedDoc}
          onHide={() => setSelectedDoc(null)}
          documentId={selectedDoc.id}
          documentTitle={selectedDoc.title}
          dossierId={dossierId}
        />
      )}
    </>
  )
}

export default DossierDocumentsTab
