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
    console.log("  manual_id:", row.manual_id, "title:", row.title, "page:", row.page_label);
    console.log("  snippet:", JSON.stringify(row.snippet.slice(0, 150)));
  }
}

async function main() {
  await tryTerm("checklist");
  await tryTerm("Checklist");
}
main().catch((e) => { console.error(e); process.exit(1); });
