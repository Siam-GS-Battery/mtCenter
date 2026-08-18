-- 0021_auth_password.sql
-- Adds employee_id + password login support to profiles.
-- profiles.employee_id (0001_init.sql) already doubles as the login identifier;
-- this migration adds the password material itself:
--   password_hash          bcrypt hash of the user's password (NULL until seeded)
--   must_change_password   forces a password change on first/next login; defaults
--                          to true so freshly-seeded default passwords cannot be
--                          used indefinitely
--   password_updated_at    timestamp of the last password change, for auditing
-- RLS on profiles is already enabled with no policies (see 0001_init.sql) and
-- that convention is unchanged here: all access continues to go through the
-- backend server using the Supabase service-role key.

alter table profiles add column if not exists password_hash text;
alter table profiles add column if not exists must_change_password boolean not null default true;
alter table profiles add column if not exists password_updated_at timestamptz;
