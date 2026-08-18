/**
 * seed-passwords.ts
 *
 * Seeds a default password for every profile that does not yet have one.
 * The default password for a profile is its own employee_id, bcrypt-hashed.
 * must_change_password is set to true so nobody can keep using the default
 * password indefinitely.
 *
 * Usage (from backend/):
 *   npm run seed:passwords
 *   npm run seed:passwords -- --force   (re-hash + reset ALL profiles, not just NULL ones)
 *
 * IDEMPOTENCE
 * Without --force, only profiles where password_hash IS NULL are touched, so
 * re-running never overwrites a password someone has already changed.
 */

import bcrypt from "bcryptjs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supabase } from "../src/lib/supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, "seed-passwords-report.json");

const SALT_ROUNDS = 10;

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");

interface ProfileRow {
  id: string;
  employee_id: string;
  password_hash: string | null;
}

interface Report {
  ranAt: string;
  force: boolean;
  total: number;
  seeded: number;
  skipped: number;
  seededEmployeeIds: string[];
}

async function main() {
  console.log(`seed-passwords — ${FORCE ? "FORCE (re-seed all)" : "default (NULL only)"}`);

  const { data, error } = await supabase.from("profiles").select("id,employee_id,password_hash");
  if (error) throw new Error(`read profiles: ${error.message}`);
  const profiles = (data ?? []) as ProfileRow[];

  console.log(`  profiles=${profiles.length}`);

  const toSeed = profiles.filter((p) => FORCE || p.password_hash === null);
  const skipped = profiles.length - toSeed.length;

  console.log(`  to seed: ${toSeed.length}, skipped (already has hash): ${skipped}`);

  const now = new Date().toISOString();
  const seededEmployeeIds: string[] = [];

  for (const profile of toSeed) {
    const passwordHash = bcrypt.hashSync(profile.employee_id, SALT_ROUNDS);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        password_hash: passwordHash,
        must_change_password: true,
        password_updated_at: now,
      })
      .eq("id", profile.id);
    if (updateError) throw new Error(`update profile ${profile.id}: ${updateError.message}`);
    seededEmployeeIds.push(profile.employee_id);
  }

  const report: Report = {
    ranAt: now,
    force: FORCE,
    total: profiles.length,
    seeded: toSeed.length,
    skipped,
    seededEmployeeIds,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nseeded ${toSeed.length} / ${profiles.length} profiles (skipped ${skipped})`);
  console.log(`report -> ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error("\nseed-passwords FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
});
