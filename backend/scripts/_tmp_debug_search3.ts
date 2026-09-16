import { supabase } from "../src/lib/supabase.js";

async function main() {
  const { data, error } = await supabase
    .from("manuals")
    .select("id,title,markdown_content")
    .eq("id", "843308b3-4f4d-407a-a819-9c997f01b033")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("not found");
  const content = data.markdown_content as string;
  console.log("length:", content.length);
  const idxLower = content.toLowerCase().indexOf("checklist");
  console.log("first 'checklist' idx:", idxLower);
  console.log(content.slice(Math.max(0, idxLower - 100), idxLower + 200));
  console.log("--- headings ---");
  const headingRe = /^##\s.*$/gm;
  let m;
  while ((m = headingRe.exec(content))) {
    console.log(m.index, m[0]);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
