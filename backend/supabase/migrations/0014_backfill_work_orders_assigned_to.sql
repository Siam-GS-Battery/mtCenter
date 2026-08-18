-- 0014_backfill_work_orders_assigned_to.sql
-- Data backfill (no schema change).
--
-- Bug: work_orders.assigned_to is supposed to hold profiles.id (format
-- 'usr-<10 hex chars>', or legacy seed ids 'usr-tech-01' / 'usr-eng-01' /
-- 'usr-sup-01'), but a since-fixed app bug wrote currentUser.name (a Thai
-- display name) instead. At the time of writing, 17 of 8,606 rows hold a
-- name instead of a profile id.
--
-- This migration repoints those 17 rows at the matching profiles.id by
-- exact name match. It is idempotent/safe to re-run: only rows that do not
-- already look like a profile id ('usr-%') are touched, and once fixed a row
-- no longer matches that condition on a subsequent run.

update work_orders wo
set assigned_to = p.id
from profiles p
where wo.assigned_to not like 'usr-%'
  and p.name = wo.assigned_to
  -- Guard against ambiguous names: only rewrite when exactly one profile
  -- has this name, so we never arbitrarily pick a profile and corrupt data.
  and (select count(*) from profiles p2 where p2.name = wo.assigned_to) = 1;

-- Any remaining rows where assigned_to is still not 'usr-%' had no exact,
-- unique profiles.name match (typo, ambiguous/duplicate name, or the person
-- has no profile row). These are intentionally left untouched rather than
-- nulled out, and must be reconciled by hand.
