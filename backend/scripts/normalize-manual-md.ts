// One-off cleanup script: normalizes markdown whitespace/structure issues in
// docs/Manual_MD/**.md that were introduced by the PDF->MD OCR conversion.
//
// Why this exists: many source files have lines OCR-indented by 4+ spaces
// that are not legitimate nested list content. When rendered by
// react-markdown, a line indented 4+ spaces is parsed as an indented code
// block (a grey monospace box) instead of prose. This script de-indents such
// runs, collapses excessive blank lines, adds blank lines around GFM tables
// and ATX headings that are missing them, trims stray trailing whitespace
// (preserving deliberate two-space hard line breaks), and ensures a single
// trailing newline at EOF.
//
// HARD RULE: this script only changes whitespace/structure. It never
// changes, reorders, or deletes non-whitespace content. Before writing any
// file, it asserts that content with all whitespace stripped is byte-for-byte
// identical between the original and the transformed version; if that
// assertion fails, the file is left untouched and reported as
// "failed-content-changed".
//
// Usage (run from backend/):
//   npm run normalize:manuals -- --dry-run                (report only, no writes)
//   npm run normalize:manuals -- --only=laser_mark         (case-insensitive substring filter on file path)
//   npm run normalize:manuals                              (LIVE — rewrites matching files in place)

import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice("--only=".length).trim().toLowerCase() : null;

const MANUAL_MD_DIR = path.resolve(process.cwd(), "..", "docs", "Manual_MD");

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function findMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findMarkdownFiles(abs));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(abs);
    }
  }
  return out;
}

function wants(relFile: string): boolean {
  return !ONLY || relFile.toLowerCase().includes(ONLY);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FENCE_RE = /^\s*```/;
const LIST_ITEM_RE = /^(\s*)([-*+]|\d+[.)])\s/;
const ATX_HEADING_RE = /^#{1,6}\s/;

function isBlank(line: string): boolean {
  return line.trim() === "";
}

function leadingSpaces(line: string): number {
  const m = line.match(/^ */);
  return m ? m[0].length : 0;
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|");
}

interface TransformStats {
  deindentedBlocks: number;
  blankLinesCollapsed: number;
  tablesFixed: number;
  headingsSpaced: number;
}

// Step 1: de-indent accidental code blocks (runs of 4+ space indented lines
// outside fences and outside legitimate nested list continuations).
function deindentAccidentalBlocks(lines: string[], stats: TransformStats): string[] {
  const out: string[] = [];
  let inFence = false;

  // Track whether we're "inside" a list context: once we see a list item
  // marker, subsequent more-indented lines are considered its continuation
  // and are left alone, until we hit a blank line followed by a
  // non-indented, non-list line (a clear dedent back to top level).
  let listActive = false;
  let listMarkerIndent = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      out.push(line);
      i++;
      continue;
    }

    if (inFence) {
      out.push(line);
      i++;
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      listActive = true;
      listMarkerIndent = leadingSpaces(line);
      out.push(line);
      i++;
      continue;
    }

    if (isBlank(line)) {
      out.push(line);
      i++;
      continue;
    }

    const indent = leadingSpaces(line);

    // If we're tracking an active list and this line is indented enough to
    // be a continuation of that list item (>= marker indent), leave it.
    if (listActive && indent > listMarkerIndent) {
      out.push(line);
      i++;
      continue;
    }
    // A non-indented / lightly-indented, non-list line ends list tracking.
    if (indent <= listMarkerIndent) {
      listActive = false;
    }

    if (indent >= 4 && !LIST_ITEM_RE.test(line)) {
      // Collect the contiguous run of over-indented, non-list, non-fence,
      // non-blank lines.
      const block: string[] = [];
      let j = i;
      while (
        j < lines.length &&
        !isBlank(lines[j]) &&
        !FENCE_RE.test(lines[j]) &&
        !LIST_ITEM_RE.test(lines[j]) &&
        leadingSpaces(lines[j]) >= 4
      ) {
        block.push(lines[j]);
        j++;
      }

      const commonIndent = Math.min(...block.map(leadingSpaces));
      const deindented = block.map((l) => {
        let stripped = l.slice(commonIndent);
        const remaining = leadingSpaces(stripped);
        if (remaining >= 4) {
          stripped = " ".repeat(3) + stripped.slice(remaining);
        }
        return stripped;
      });

      out.push(...deindented);
      stats.deindentedBlocks++;
      i = j;
      continue;
    }

    out.push(line);
    i++;
  }

  return out;
}

// Step 2: collapse 3+ consecutive blank lines to exactly 1.
function collapseBlankLines(lines: string[], stats: TransformStats): string[] {
  const out: string[] = [];
  let blankRun = 0;
  for (const line of lines) {
    if (isBlank(line)) {
      blankRun++;
    } else {
      if (blankRun >= 3) {
        stats.blankLinesCollapsed++;
        out.push("");
      } else {
        for (let k = 0; k < blankRun; k++) out.push("");
      }
      blankRun = 0;
      out.push(line);
    }
  }
  if (blankRun >= 3) {
    stats.blankLinesCollapsed++;
    out.push("");
  } else {
    for (let k = 0; k < blankRun; k++) out.push("");
  }
  return out;
}

// Step 3: ensure blank line before/after GFM table blocks.
function fixTableSpacing(lines: string[], stats: TransformStats): string[] {
  const out: string[] = [];
  let inFence = false;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      out.push(line);
      i++;
      continue;
    }
    if (!inFence && isTableRow(line)) {
      const prev = out.length > 0 ? out[out.length - 1] : null;
      let fixedThisTable = false;
      if (prev !== null && !isBlank(prev) && !isTableRow(prev)) {
        out.push("");
        fixedThisTable = true;
      }
      const block: string[] = [];
      let j = i;
      while (j < lines.length && isTableRow(lines[j])) {
        block.push(lines[j]);
        j++;
      }
      out.push(...block);
      const next = j < lines.length ? lines[j] : null;
      if (next !== null && !isBlank(next) && !isTableRow(next) && !FENCE_RE.test(next)) {
        out.push("");
        fixedThisTable = true;
      }
      if (fixedThisTable) stats.tablesFixed++;
      i = j;
      continue;
    }
    out.push(line);
    i++;
  }
  return out;
}

// Step 4: trim trailing whitespace, preserving deliberate two-space hard
// breaks.
function trimTrailingWhitespace(lines: string[]): string[] {
  let inFence = false;
  return lines.map((line) => {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;
    const trailingMatch = line.match(/[ \t]+$/);
    if (!trailingMatch) return line;
    if (trailingMatch[0] === "  ") return line; // deliberate hard break
    return line.replace(/[ \t]+$/, "");
  });
}

// Step 5: ensure blank line before/after ATX headings.
function spaceHeadings(lines: string[], stats: TransformStats): string[] {
  const out: string[] = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence && ATX_HEADING_RE.test(line)) {
      const prev = out.length > 0 ? out[out.length - 1] : null;
      let spaced = false;
      if (prev !== null && !isBlank(prev)) {
        out.push("");
        spaced = true;
      }
      out.push(line);
      const next = i + 1 < lines.length ? lines[i + 1] : null;
      if (next !== null && !isBlank(next)) {
        out.push("");
        spaced = true;
      }
      if (spaced) stats.headingsSpaced++;
      continue;
    }
    out.push(line);
  }
  return out;
}

// Step 6: exactly one trailing newline.
function normalizeEOF(content: string): string {
  return content.replace(/\s+$/, "") + "\n";
}

function normalize(rawContent: string): { content: string; stats: TransformStats } {
  const stats: TransformStats = {
    deindentedBlocks: 0,
    blankLinesCollapsed: 0,
    tablesFixed: 0,
    headingsSpaced: 0,
  };

  let lines = rawContent.split(/\r\n|\n/);
  lines = deindentAccidentalBlocks(lines, stats);
  lines = collapseBlankLines(lines, stats);
  lines = fixTableSpacing(lines, stats);
  lines = trimTrailingWhitespace(lines);
  lines = spaceHeadings(lines, stats);

  let content = lines.join("\n");
  content = normalizeEOF(content);

  return { content, stats };
}

function stripWhitespace(s: string): string {
  return s.replace(/\s/g, "");
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

interface FileReportEntry {
  file: string;
  linesBefore: number;
  linesAfter: number;
  deindentedBlocks: number;
  blankLinesCollapsed: number;
  tablesFixed: number;
  headingsSpaced: number;
  status: "would-write" | "written" | "unchanged" | "failed-content-changed";
}

const results: FileReportEntry[] = [];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log(`Normalize starting. dryRun=${DRY_RUN} only=${ONLY ?? "(all files)"}`);
  console.log(`Manual_MD dir: ${MANUAL_MD_DIR}`);

  if (!fs.existsSync(MANUAL_MD_DIR)) {
    console.error(`[FAIL] Manual_MD dir not found: ${MANUAL_MD_DIR}`);
    process.exit(1);
  }

  const allFiles = findMarkdownFiles(MANUAL_MD_DIR);
  const relFiles = allFiles
    .map((abs) => path.relative(MANUAL_MD_DIR, abs).split(path.sep).join("/"))
    .sort();
  const toProcess = relFiles.filter((rel) => wants(rel));

  console.log(`Found ${relFiles.length} markdown file(s); processing ${toProcess.length} after --only filter.\n`);

  let failedCount = 0;

  for (const rel of toProcess) {
    const abs = path.join(MANUAL_MD_DIR, ...rel.split("/"));
    try {
      const rawContent = fs.readFileSync(abs, "utf-8");
      const linesBefore = rawContent.split(/\r\n|\n/).length;
      const { content, stats } = normalize(rawContent);
      const linesAfter = content.split(/\r\n|\n/).length;

      if (stripWhitespace(content) !== stripWhitespace(rawContent)) {
        failedCount++;
        console.error(`[FAIL] "${rel}": content mismatch after normalization (non-whitespace changed) — NOT writing.`);
        results.push({
          file: rel,
          linesBefore,
          linesAfter,
          deindentedBlocks: stats.deindentedBlocks,
          blankLinesCollapsed: stats.blankLinesCollapsed,
          tablesFixed: stats.tablesFixed,
          headingsSpaced: stats.headingsSpaced,
          status: "failed-content-changed",
        });
        continue;
      }

      const changed = content !== rawContent;

      if (!changed) {
        results.push({
          file: rel,
          linesBefore,
          linesAfter,
          deindentedBlocks: stats.deindentedBlocks,
          blankLinesCollapsed: stats.blankLinesCollapsed,
          tablesFixed: stats.tablesFixed,
          headingsSpaced: stats.headingsSpaced,
          status: "unchanged",
        });
        continue;
      }

      if (DRY_RUN) {
        console.log(`[ok]   (dry-run) "${rel}" would change.`);
        results.push({
          file: rel,
          linesBefore,
          linesAfter,
          deindentedBlocks: stats.deindentedBlocks,
          blankLinesCollapsed: stats.blankLinesCollapsed,
          tablesFixed: stats.tablesFixed,
          headingsSpaced: stats.headingsSpaced,
          status: "would-write",
        });
        continue;
      }

      fs.writeFileSync(abs, content, "utf-8");
      console.log(`[ok]   "${rel}" normalized and written.`);
      results.push({
        file: rel,
        linesBefore,
        linesAfter,
        deindentedBlocks: stats.deindentedBlocks,
        blankLinesCollapsed: stats.blankLinesCollapsed,
        tablesFixed: stats.tablesFixed,
        headingsSpaced: stats.headingsSpaced,
        status: "written",
      });
    } catch (err) {
      failedCount++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] "${rel}": ${message}`);
      results.push({
        file: rel,
        linesBefore: 0,
        linesAfter: 0,
        deindentedBlocks: 0,
        blankLinesCollapsed: 0,
        tablesFixed: 0,
        headingsSpaced: 0,
        status: "failed-content-changed",
      });
    }
  }

  console.log("\n=== Normalize Summary ===");
  console.log(
    "file".padEnd(60),
    "before".padStart(7),
    "after".padStart(7),
    "deindent".padStart(9),
    "blankColl".padStart(10),
    "tablesFix".padStart(10),
    "headSpace".padStart(10),
    "status".padStart(22)
  );
  for (const r of results) {
    console.log(
      r.file.padEnd(60),
      String(r.linesBefore).padStart(7),
      String(r.linesAfter).padStart(7),
      String(r.deindentedBlocks).padStart(9),
      String(r.blankLinesCollapsed).padStart(10),
      String(r.tablesFixed).padStart(10),
      String(r.headingsSpaced).padStart(10),
      r.status.padStart(22)
    );
  }

  const written = results.filter((r) => r.status === "written").length;
  const wouldWrite = results.filter((r) => r.status === "would-write").length;
  const unchanged = results.filter((r) => r.status === "unchanged").length;

  console.log(
    `\nTotal: ${results.length}  Written: ${written}  WouldWrite(dry-run): ${wouldWrite}  Unchanged: ${unchanged}  Failed: ${failedCount}`
  );
  if (DRY_RUN) {
    console.log("(dry-run: no files written; 'would-write' rows above are what a real run would change)");
  }

  if (failedCount > 0) {
    process.exit(1);
  }
}

main();
