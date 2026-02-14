# Specification

## Summary
**Goal:** Enhance the Dashboard to allow drilling into all tasks, display total revenue across tasks, and keep Payment Status analytics/drill-down working.

**Planned changes:**
- Make the Dashboard “Total Tasks” summary card clickable to open the existing TaskDetailDialog showing all tasks, with clear English title/description indicating it’s an all-tasks view.
- Add a new Dashboard KPI card labeled “Total Revenue” calculated as the sum of `task.bill` for the currently loaded tasks (showing $0.00 when no tasks).
- Update the TaskDetailDialog task list table to include a “Revenue” column populated from `task.bill`, formatted in consistent English/US currency.
- Ensure the existing “Payment Status Distribution” visualization still renders and its click-to-drill-down continues to open TaskDetailDialog filtered by payment status.

**User-visible outcome:** Users can click “Total Tasks” to see all tasks in the task dialog, see a “Total Revenue” KPI on the Dashboard, view per-task revenue in the dialog table, and continue to drill into tasks by payment status from the Dashboard.
