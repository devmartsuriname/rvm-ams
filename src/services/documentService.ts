import { supabase } from '@/integrations/supabase/client'
import type { Tables, Enums } from '@/integrations/supabase/types'
import { handleGuardedUpdate } from '@/utils/rls-error'

export type RvmDocument = Tables<'rvm_document'>
export type RvmDocumentVersion = Tables<'rvm_document_version'>
export type DocumentType = Enums<'document_type'>
export type ConfidentialityLevel = Enums<'confidentiality_level'>

export type DocumentWithVersion = RvmDocument & {
  current_version: RvmDocumentVersion | null
  creator: { full_name: string } | null
}

export type VersionWithUploader = RvmDocumentVersion & {
  uploader: { full_name: string } | null
}

/**
 * Document Service — DMS-Light CRUD operations
 * INSERT: secretary_rvm, admin_dossier, admin_reporting
 * SELECT: All RVM roles
 */
export const documentService = {
  /**
   * Fetch all documents for a dossier with current version info
   */
  async fetchDocumentsByDossier(dossierId: string): Promise<DocumentWithVersion[]> {
    const { data, error } = await supabase
      .from('rvm_document')
      .select(`
        *,
        creator:created_by(full_name),
        current_version:current_version_id(*)
      `)
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as unknown as DocumentWithVersion[]
  },

  /**
   * Create a document record, upload file, create version, link current_version_id
   */
  async createDocument(params: {
    dossierId: string
    title: string
    docType: DocumentType
    confidentialityLevel: ConfidentialityLevel
    file: File
    decisionId?: string | null
    agendaItemId?: string | null
    createdBy?: string | null
  }) {
    const { dossierId, title, docType, confidentialityLevel, file, decisionId, agendaItemId, createdBy } = params

    // 1. Insert document record
    const { data: doc, error: docError } = await supabase
      .from('rvm_document')
      .insert({
        dossier_id: dossierId,
        title,
        doc_type: docType,
        confidentiality_level: confidentialityLevel,
        decision_id: decisionId ?? null,
        agenda_item_id: agendaItemId ?? null,
        created_by: createdBy ?? null,
      })
      .select()
      .single()

    if (docError) throw docError

    // 2. Upload file to storage
    const storagePath = `${dossierId}/${doc.id}/v1/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('rvm-documents')
      .upload(storagePath, file, { upsert: false })

    if (uploadError) {
      console.error('[DocumentService] Upload failed, document orphaned:', uploadError)
      throw uploadError
    }

    // 3. Create version record
    const { data: version, error: versionError } = await supabase
      .from('rvm_document_version')
      .insert({
        document_id: doc.id,
        version_number: 1,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        storage_path: storagePath,
        uploaded_by: createdBy ?? null,
      })
      .select()
      .single()

    if (versionError) throw versionError

    // 4. Link current_version_id
    await supabase
      .from('rvm_document')
      .update({ current_version_id: version.id })
      .eq('id', doc.id)

    return doc
  },

  /**
   * Upload a new version for an existing document
   */
  async uploadNewVersion(params: {
    documentId: string
    dossierId: string
    file: File
    uploadedBy?: string | null
  }) {
    const { documentId, dossierId, file, uploadedBy } = params

    // Get max version number
    const { data: versions, error: fetchError } = await supabase
      .from('rvm_document_version')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)

    if (fetchError) throw fetchError
    const nextVersion = (versions?.[0]?.version_number ?? 0) + 1

    // Upload file
    const storagePath = `${dossierId}/${documentId}/v${nextVersion}/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('rvm-documents')
      .upload(storagePath, file, { upsert: false })

    if (uploadError) throw uploadError

    // Create version record
    const { data: version, error: versionError } = await supabase
      .from('rvm_document_version')
      .insert({
        document_id: documentId,
        version_number: nextVersion,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        storage_path: storagePath,
        uploaded_by: uploadedBy ?? null,
      })
      .select()
      .single()

    if (versionError) throw versionError

    // Update current_version_id
    await supabase
      .from('rvm_document')
      .update({ current_version_id: version.id })
      .eq('id', documentId)

    return version
  },

  /**
   * Fetch version history for a document
   */
  async fetchVersionHistory(documentId: string): Promise<VersionWithUploader[]> {
    const { data, error } = await supabase
      .from('rvm_document_version')
      .select(`*, uploader:uploaded_by(full_name)`)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })

    if (error) throw error
    return (data ?? []) as unknown as VersionWithUploader[]
  },

  /**
   * Create a signed download URL (60 min expiry)
   */
  async getDownloadUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('rvm-documents')
      .createSignedUrl(storagePath, 3600)

    if (error) throw error
    return data.signedUrl
  },
}
