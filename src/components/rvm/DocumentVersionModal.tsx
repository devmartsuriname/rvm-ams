import { useState, useCallback } from 'react'
import { Modal, Table, Button } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import { useDocumentVersions, useUploadNewVersion } from '@/hooks/useDocuments'
import { useUserRoles } from '@/hooks/useUserRoles'
import { documentService } from '@/services/documentService'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/utils/rls-error'
import { LoadingState } from '@/components/rvm/StateComponents'

type Props = {
  show: boolean
  onHide: () => void
  documentId: string | undefined
  documentTitle: string
  dossierId: string
}

const DocumentVersionModal = ({ show, onHide, documentId, documentTitle, dossierId }: Props) => {
  const { canUploadDocument, userId } = useUserRoles()
  const { data: versions, isLoading } = useDocumentVersions(documentId)
  const uploadVersion = useUploadNewVersion()
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 20 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!file || !documentId) return
    try {
      await uploadVersion.mutateAsync({
        documentId,
        dossierId,
        file,
        uploadedBy: userId ?? null,
      })
      toast.success('New version uploaded')
      setFile(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDownload = async (storagePath: string, fileName: string) => {
    try {
      const url = await documentService.getDownloadUrl(storagePath)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
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

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Version History — {documentTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <LoadingState message="Loading versions..." />
        ) : (
          <Table responsive hover size="sm">
            <thead>
              <tr>
                <th>Version</th>
                <th>File Name</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {versions?.map((v) => (
                <tr key={v.id}>
                  <td>v{v.version_number}</td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>{v.file_name}</td>
                  <td>{formatSize(v.file_size)}</td>
                  <td>{(v as any).uploader?.full_name ?? '-'}</td>
                  <td>{formatDate(v.uploaded_at)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleDownload(v.storage_path, v.file_name)}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {canUploadDocument && (
          <div className="mt-3">
            <h6>Upload New Version</h6>
            <div
              {...getRootProps()}
              className={`border border-2 border-dashed rounded p-3 text-center ${isDragActive ? 'border-primary bg-light' : 'border-secondary'}`}
              style={{ cursor: 'pointer' }}
            >
              <input {...getInputProps()} />
              {file ? (
                <span>{file.name} <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null) }}>Remove</Button></span>
              ) : (
                <small className="text-muted">Drop a file or click to browse</small>
              )}
            </div>
            {file && (
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={handleUpload}
                disabled={uploadVersion.isPending}
              >
                {uploadVersion.isPending ? 'Uploading...' : 'Upload Version'}
              </Button>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DocumentVersionModal
