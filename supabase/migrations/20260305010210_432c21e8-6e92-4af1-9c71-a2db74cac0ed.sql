
-- Phase 12: Create rvm-documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rvm-documents', 'rvm-documents', false);

-- Storage RLS: SELECT for all RVM roles (matches rvm_document_select policy)
CREATE POLICY "rvm_documents_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'rvm-documents'
  AND (
    has_any_role(ARRAY[
      'chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'admin_agenda',
      'admin_reporting', 'audit_readonly'
    ])
    OR is_super_admin()
  )
);

-- Storage RLS: INSERT for upload-authorized roles
CREATE POLICY "rvm_documents_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rvm-documents'
  AND (
    has_any_role(ARRAY['secretary_rvm', 'admin_dossier', 'admin_reporting'])
    OR is_super_admin()
  )
);
