# Specification

## Summary
**Goal:** Fix Bulk Task Upload so it no longer generates/sends an invalid `ownerPrincipal` from CSV values and instead lets bulk-uploaded tasks default to being owned by the currently authenticated uploader (matching single-task creation).

**Planned changes:**
- Update `frontend/src/components/BulkUploadSection.tsx` to stop deriving ownership from CSV/user list and to stop constructing/sending any `ownerPrincipal` (including removing any `Principal.fromText(...)` usage on CSV-derived/placeholder values).
- Refactor bulk upload to keep the existing CSV column parsing/validation and template behavior unchanged, while omitting owner so the backend defaults ownership to the caller.
- Update `frontend/src/hooks/useQueries.ts` bulk-create mutation typing/payload so `bulkCreateTasks` does not require an explicit owner Principal per task (allow omitted/null owner) and keep existing English success/error toasts.

**User-visible outcome:** Uploading a CSV in Bulk Task Upload no longer shows a Principal checksum error (e.g., referencing `user-0` / `aaaaa-aa`), and the uploaded tasks are successfully created under the currently signed-in uploader’s ownership.
