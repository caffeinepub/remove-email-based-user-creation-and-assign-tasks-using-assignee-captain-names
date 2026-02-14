# Specification

## Summary
**Goal:** Make the Dashboard task list dialog (TaskDetailDialog) substantially larger on desktop while staying responsive on smaller screens.

**Planned changes:**
- Update the Dashboard TaskDetailDialog composition to use larger, viewport-relative width/height on desktop (e.g., via DialogContent className overrides) while constraining to the viewport on smaller screens.
- Ensure the task list/table area inside the dialog scrolls appropriately (vertical and, if needed, horizontal) so key columns (e.g., Assignee, Captain, Actions) remain accessible without clipping.
- Keep Shadcn UI component source files unchanged; apply sizing only in app-owned components (e.g., frontend/src/components/TaskDetailDialog.tsx and related callers).

**User-visible outcome:** When opening Dashboard dialogs like “All Categories” (and other task list dialogs opened from filters/chart clicks), the window is noticeably wider and taller on desktop and remains usable and non-overflowing on smaller screens.
