// Sanitization shared by every code path that injects manual excerpt text into
// the LLM prompt: aiContext.ts's embedding-based manual section (manualRetrieval.ts
// hits) and manualMarkdownSearch.ts's keyword-over-markdown snippets. Extracted
// into its own module so both paths neutralize prompt-injection risk identically —
// duplicating this logic in two places risks them silently diverging over time.
//
// Preserves newlines (unlike the single-line sanitizeField in aiContext.ts) because
// manual content has alarm-code tables and numbered steps whose meaning depends on
// line breaks; collapsing to one line would make them unreadable to both the model
// and a human checking the citation.

// The literal delimiter text routes/ai.ts wraps the whole knowledge block with
// ("=== ข้อมูลจริงจากระบบ (เริ่ม/จบ) ==="). A manual excerpt must never be able to
// reproduce this text, or an attacker could forge a fake close/reopen of the
// trusted-data block from content embedded in a manual.
export const TRUSTED_BLOCK_DELIMITER_RE =
  /=*\s*ข้อมูลจริงจากระบบ\s*(\(\s*(?:เริ่ม|จบ)\s*\))?\s*=*/g;

export function sanitizeManualExcerpt(raw: string, maxChars: number): string {
  let s = raw.replace(/\r\n?/g, "\n");
  s = s.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, " ");
  s = s.replace(TRUSTED_BLOCK_DELIMITER_RE, " ");
  // Collapse runs of 3+ blank lines down to one — saves character budget without
  // losing structure.
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/[ \t]+/g, " ").trim();
  if (s.length > maxChars) {
    s = s.slice(0, maxChars) + "…";
  }
  return s;
}
