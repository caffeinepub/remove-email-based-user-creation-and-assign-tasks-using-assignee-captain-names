# Specification

## Summary
**Goal:** Let admins manage a directory of Assignee + Captain pairs and allow task forms to optionally select from that directory to auto-fill assignee/captain fields.

**Planned changes:**
- Add backend storage for an assignee directory (assigneeName, captainName) with admin-only create/update/delete APIs and a user-accessible list API.
- Enforce permissions via existing access control (admins can mutate; users can read/list) and define/handle duplicate assigneeName behavior consistently.
- Add an Admin Panel tab for managing assignees (create, list, edit, delete) with toast-based success/failure feedback.
- Update task create/edit dialogs to fetch the directory, show an optional assignee selector, auto-fill Assignee Name and Captain Name, and still allow manual edits/overrides (including an empty-state when no entries exist).
- Add React Query hooks for listing and mutating assignee entries, with caching and invalidation so task screens and admin screens reuse data.
- Extend upgrade/migration logic so upgrades initialize the new assignee directory safely (default empty) without affecting existing task data.

**User-visible outcome:** Admins can add and maintain assignee/captain pairs in the Admin area, and users creating or editing tasks can optionally pick an assignee to auto-fill assignee and captain fields while still being able to edit them manually.
