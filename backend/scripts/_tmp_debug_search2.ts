import { supabase } from "../src/lib/supabase.js";

async function tryTerm(term: string) {
  const { data, error } = await supabase.rpc("search_manual_markdown", {
    search_terms: [term],
    filter_machine_models: null,
    max_hits_per_manual: 6,
    snippet_chars: 300,
    filter_manual_ids: ["843308b3-4f4d-407a-a819-9c997f01b033"],
  });
  console.log("term:", term, "error:", error?.message, "rows:", data?.length);
  for (const row of data ?? []) {
    console.log("  page:", row.page_label, "snippet:", JSON.stringify(row.snippet.slice(0, 80)));
  }
}

async function main() {
  for (const t of ["PM", "checklist", "Checklist", "PM Checklist", "preventive maintenance", "คู่มือ", "บำรุง"]) {
    await tryTerm(t);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
