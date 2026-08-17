-- 0012_add_work_order_notes.sql
-- Frontend sends technicianNote, revisionNote and actionPlanSteps on every
-- work-order update, but these columns never existed on work_orders — the
-- values were silently dropped. Add them (additive only).

alter table work_orders
  add column if not exists technician_note text,     -- WorkOrder.technicianNote — free-text note from the technician
  add column if not exists revision_note text,        -- WorkOrder.revisionNote — reason an engineer sent the WO back for revision
  add column if not exists action_plan_steps jsonb;   -- WorkOrder.actionPlanSteps — WorkOrderStep[] ({ text, addedBy?, addedAt? })
