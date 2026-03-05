import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService, type DocumentType, type ConfidentialityLevel } from '@/services/documentService'

const QUERY_KEY = 'documents'

export function useDocumentsByDossier(dossierId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'by-dossier', dossierId],
    queryFn: () => documentService.fetchDocumentsByDossier(dossierId!),
    enabled: !!dossierId,
  })
}

export function useDocumentVersions(documentId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'versions', documentId],
    queryFn: () => documentService.fetchVersionHistory(documentId!),
    enabled: !!documentId,
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      dossierId: string
      title: string
      docType: DocumentType
      confidentialityLevel: ConfidentialityLevel
      file: File
      decisionId?: string | null
      agendaItemId?: string | null
      createdBy?: string | null
    }) => documentService.createDocument(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'by-dossier', variables.dossierId] })
    },
  })
}

export function useUploadNewVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      documentId: string
      dossierId: string
      file: File
      uploadedBy?: string | null
    }) => documentService.uploadNewVersion(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'by-dossier', variables.dossierId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'versions', variables.documentId] })
    },
  })
}
