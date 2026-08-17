-- 0006_wipe_seed.sql
-- Wipe mock seed data now that real data (Excel imports) is replacing it.
--
-- IMPORTANT — this migration was revised after a read-only audit of the live database
-- found that it is NOT pure mock data: real rows created through the running app after
-- the original seed had accumulated alongside the mock rows. An earlier version of this
-- file used a blanket `TRUNCATE ... CASCADE` across all 6 tables, which would have
-- destroyed that real data. Do not revert to that approach. Live-data audit findings at
-- the time this was written:
--   profiles            3 rows  — real user data, never touched by this migration
--   machines             4 rows  — mock only
--   spare_parts           6 rows  — mock only
--   telemetry_readings 2,028 rows  — mock only (source = 'seed')
--   work_orders           9 rows  — 5 mock (wo-101..wo-105) + 4 real rows created via the
--                                  app (uuid ids) — user confirmed these 4 are throwaway
--                                  test data and are fine to clear along with the mock
--                                  rows, since the full 8,589-row Excel import replaces
--                                  work_orders entirely
--   work_order_parts      4 rows  — child rows of the 4 real/test work_orders above
--   manuals               4 rows  — 3 mock (doc-01, doc-02, doc-03) + 1 REAL uploaded PDF
--                                  (id e129575f-a907-4a8d-88f5-90bd9bada13d, title
--                                  "Operation 4.0 Topic 7 and 9_R3", file_path
--                                  99f65a82-eb24-4f91-bc95-42ecfc907fcb.pdf) — this row
--                                  MUST survive, or its file becomes an orphan in the
--                                  Storage bucket with no DB row pointing at it (and no
--                                  clean way to recover the mapping later)
--
-- profiles is intentionally NOT touched — Excel has no user/employee data, so the
-- existing user records are the only real data we have for that table.
--
-- The migrations that originally inserted the mock data — 0002_seed.sql and
-- 0004_seed_telemetry.sql — have been deleted from this migrations directory so a fresh
-- `supabase db reset` does not reintroduce mock rows. They were already applied against
-- the live database, so their effects still need to be undone here explicitly.

-- machines / spare_parts / telemetry_readings / work_orders / work_order_parts: fully
-- mock, or (for the 4 work_orders/work_order_parts rows) confirmed-discardable test data
-- that will be entirely superseded by the Excel import. Truncating all five together in
-- one statement satisfies the FK between work_order_parts -> work_orders and
-- telemetry_readings -> machines without needing CASCADE (Postgres allows a single
-- TRUNCATE statement to include both a referenced and referencing table together).
truncate table
  telemetry_readings,
  work_order_parts,
  work_orders,
  spare_parts,
  machines
restart identity;

-- manuals: do NOT truncate. One row in this table is a real user-uploaded PDF whose
-- file_path points at a real object in the "manuals" Storage bucket — truncating the
-- table would delete that row's reference while leaving the actual PDF file behind in
-- Storage as an unrecoverable orphan (no DB row left to know which file_path/bucket
-- object it was). Delete only the known mock rows by id instead.
delete from manuals where id in ('doc-01', 'doc-02', 'doc-03');

-- profiles: left untouched on purpose.
