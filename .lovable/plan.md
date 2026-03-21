# Fix: Document Download Blocked by Chrome Iframe Sandbox

## Root Cause

The Lovable preview runs inside a sandboxed iframe. When the download handler creates an `<a>` element pointing to the Supabase storage signed URL (cross-origin) and calls `.click()`, Chrome blocks the navigation as an "unsafe attempt to load URL from frame."

## Fix

Replace the anchor-click pattern with a **fetch-as-blob** approach: fetch the signed URL content, create a local blob URL, and trigger the download from that. This avoids cross-origin navigation entirely.

Affected files:

- `src/components/rvm/DossierDocumentsTab.tsx` (lines 42-46)
- `src/components/rvm/DocumentVersionModal.tsx` (lines 54-58)

## Implementation

```typescript
const handleDownload = async (...) => {
  const signedUrl = await documentService.getDownloadUrl(storagePath)
  const response = await fetch(signedUrl)
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = fileName
  a.click()
  URL.revokeObjectURL(blobUrl)
}
```

## Operations


| #   | Op   | File                                                          |
| --- | ---- | ------------------------------------------------------------- |
| 1   | Edit | `src/components/rvm/DossierDocumentsTab.tsx` — blob download  |
| 2   | Edit | `src/components/rvm/DocumentVersionModal.tsx` — blob download |


**Total: 2 ops**  
  
**NOTE — Governance & Production Safety Additions**

1. Environment Awareness

- Detect if running inside iframe (window.self !== [window.top](http://window.top))

- Apply blob-download ONLY in iframe context

- Use direct signed URL navigation in production

2. Memory Safety

- Ensure URL.revokeObjectURL(blobUrl) is ALWAYS called (try/finally)

3. Error Handling

- If fetch fails → show user-friendly error toast:

  "Download failed. Please try again or contact support."

4. Audit Compliance (MANDATORY)

- Log download attempt in audit_log (if not already implemented)

- Include: user_id, document_id, timestamp

5. File Size Constraint

- Validate behavior for large files (>10MB)

- Blob approach must not freeze UI

6. No Backend Changes Rule

- Confirm: NO changes to storage, RLS, or signed URL generation