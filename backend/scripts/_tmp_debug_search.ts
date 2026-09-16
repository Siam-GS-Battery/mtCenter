import { searchManualMarkdown, extractSignificantTerms } from "../src/lib/manualMarkdownSearch.js";
import { expandManualQueryTerms } from "../src/lib/manualQueryExpansion.js";

async function main() {
  const prompt = "คู่มือบำรุงรักษาทั่วไปบอกอะไรบ้างเรื่อง PM";
  const raw = extractSignificantTerms(prompt);
  console.log("raw significant terms:", raw);
  const expanded = await expandManualQueryTerms(prompt, raw);
  console.log("expanded terms:", expanded);
  const hits = await searchManualMarkdown(prompt);
  for (const h of hits) {
    console.log("---");
    console.log(h.manualId, h.manualTitle, h.pageLabel);
    console.log(h.content.slice(0, 200));
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
