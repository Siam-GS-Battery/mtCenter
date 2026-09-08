import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Compact markdown renderer for a work-order description shown inside a
 * narrow card. Descriptions are AI-generated markdown (headings, bold,
 * bullet lists, sometimes tables) — this keeps everything small enough to
 * read in a card while still rendering the formatting instead of raw symbols.
 */
const descriptionMarkdownComponents: Components = {
  p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-snug">{children}</p>,
  h1: ({ children }) => (
    <p className="font-semibold text-ink mb-1 text-[13px]">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="font-semibold text-ink mb-1 text-[13px]">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="font-semibold text-ink mb-1 text-[13px]">{children}</p>
  ),
  h4: ({ children }) => (
    <p className="font-semibold text-ink mb-1 text-[13px]">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-4 space-y-0.5 mb-1.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 space-y-0.5 mb-1.5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  code: ({ children }) => (
    <code className="bg-white text-primary rounded px-1 py-0.5 text-[0.85em] font-mono">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline text-primary"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-1.5">
      <table className="text-[12px] border-collapse w-full">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-hairline px-1.5 py-1 text-left font-semibold text-ink bg-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-hairline px-1.5 py-1 align-top">{children}</td>
  ),
};

export interface WorkOrderDescriptionProps {
  description?: string | null;
  className?: string;
}

/**
 * Renders a work order's (AI-generated) markdown description inside a
 * card-friendly grey box: collapsed to a few lines by default with a
 * fade-out overlay, expandable via a small toggle when the content
 * actually overflows, and scrollable internally once expanded so a long
 * description never stretches the card.
 */
export const WorkOrderDescription: React.FC<WorkOrderDescriptionProps> = ({
  description,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const clampedRef = useRef<HTMLDivElement | null>(null);

  const trimmed = (description ?? "").trim();
  const hasContent = trimmed.length > 0;

  useEffect(() => {
    if (!hasContent || isExpanded) {
      return;
    }

    const measure = () => {
      const el = clampedRef.current;
      if (!el) {
        return;
      }
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    if (typeof ResizeObserver === "undefined" || !clampedRef.current) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(clampedRef.current);
    return () => observer.disconnect();
  }, [hasContent, isExpanded, trimmed]);

  return (
    <div className={`bg-white border border-divider shadow-sm rounded-[11px] p-3 min-w-0 break-words ${className}`}>
      <p className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase mb-1">
        รายละเอียด
      </p>

      {!hasContent ? (
        <p className="text-[13px] text-ink-muted">ไม่ระบุรายละเอียดเพิ่มเติม</p>
      ) : (
        <>
          <div
            ref={clampedRef}
            className={
              isExpanded
                ? "text-[13px] text-ink max-h-64 overflow-y-auto pr-1"
                : "text-[13px] text-ink line-clamp-3 relative"
            }
            style={
              !isExpanded
                ? {
                    maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 70%, transparent 100%)",
                  }
                : undefined
            }
          >
            <ReactMarkdown
              components={descriptionMarkdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {trimmed}
            </ReactMarkdown>
          </div>

          {isOverflowing && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-primary cursor-pointer"
            >
              <span>{isExpanded ? "ย่อลง" : "ดูเพิ่มเติม"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default WorkOrderDescription;
