import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { BookOpen, Search, Sparkles, ChevronRight, SearchX } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import type { KnowledgeArticle } from "../../data/mockData";

interface KnowledgeBaseViewProps {
  onAskAI: (prompt: string) => void;
  /**
   * บทความจาก App (ชั้นข้อมูลเดียวกับหน้าอื่น) — ไม่ดึงข้อมูลตัวอย่างมาแสดงเอง
   * ถ้ายังไม่มีข้อมูล หน้านี้จะบอกตรง ๆ ว่าคลังยังว่าง
   */
  articles?: KnowledgeArticle[];
}

const markdownComponents: Components = {
  // TopBar renders the page's only <h1>; an article heading starts at <h2>.
  h1: ({ children }) => (
    <h2 className="text-xl font-semibold text-ink mt-6 mb-3">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-ink mt-6 mb-2 pb-1 border-b border-hairline">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-ink mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-ink-muted leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 text-sm text-ink-muted space-y-1 mb-3">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 text-sm text-ink-muted space-y-1 mb-3">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-amber-300/70 bg-amber-50/70 text-amber-900 text-sm px-4 py-2 rounded-r-lg mb-3">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3 rounded-[11px] border border-hairline">
      <table className="min-w-105 w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-hairline bg-parchment px-2.5 py-2 text-left font-semibold text-ink-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-hairline px-2.5 py-2 text-ink-muted">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-parchment text-primary rounded px-1 py-0.5 text-[0.85em] font-mono">
      {children}
    </code>
  ),
};

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onAskAI,
  articles = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openArticle, setOpenArticle] = useState<KnowledgeArticle | null>(null);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" aria-hidden="true" />
        <label htmlFor="kb-search" className="sr-only">
          ค้นหาบทความความรู้
        </label>
        <input
          id="kb-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาบทความทางวิศวกรรม, LOTO, Spindle, Calibration..."
          aria-label="ค้นหาบทความทางวิศวกรรม"
          className="w-full bg-white border border-hairline rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
        />
      </div>

      {/* Articles list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[18px] border border-hairline p-10 text-center space-y-2">
          {isSearching ? (
            <SearchX className="w-10 h-10 text-ink-muted mx-auto" />
          ) : (
            <BookOpen className="w-10 h-10 text-ink-muted mx-auto" />
          )}
          {isSearching ? (
            <>
              <p className="text-sm font-semibold text-ink">
                ไม่พบบทความที่ตรงกับ "{searchQuery}"
              </p>
              <p className="text-xs text-ink-muted">
                ลองใช้คำค้นหาอื่น หรือล้างคำค้นหาเพื่อดูบทความทั้งหมด
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-1 min-h-11 px-4 py-2.5 rounded-full bg-pearl border border-divider text-ink-muted text-[13px] font-semibold hover:bg-parchment cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
              >
                ล้างคำค้นหา
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink">ยังไม่มีบทความในคลังความรู้</p>
              <p className="text-[13px] text-ink-muted">
                บทความจะแสดงที่นี่เมื่อทีมวิศวกรรมเผยแพร่องค์ความรู้เข้าระบบ
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[18px] border border-hairline p-6 hover:border-primary/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <span className="text-[13px] text-ink-muted">
                  ผู้เขียน: {item.author} · อัปเดต: {item.updated}
                </span>
              </div>

              <h3 className="text-base font-semibold text-ink leading-snug">
                {item.title}
              </h3>

              <p className="text-[13px] text-ink-muted leading-relaxed bg-parchment p-3 rounded-[11px]">
                {item.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-parchment text-ink-muted px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setOpenArticle(item)}
                  className="px-3.5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
                >
                  <span>อ่านบทความ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article reader modal */}
      {openArticle && (
        <Modal size="lg" onClose={() => setOpenArticle(null)}>
          <ModalHeader onClose={() => setOpenArticle(null)}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {openArticle.category}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-ink leading-snug">
                {openArticle.title}
              </h3>
              <div className="text-xs text-ink-muted font-normal">
                ผู้เขียน: {openArticle.author} · อัปเดต: {openArticle.updated}
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="text-xs sm:text-sm leading-relaxed text-ink-muted">
              <ReactMarkdown components={markdownComponents}>
                {openArticle.content}
              </ReactMarkdown>
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              onClick={() => {
                onAskAI(`ช่วยสรุปบทความความรู้เรื่อง "${openArticle.title}"`);
                setOpenArticle(null);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-[11px] bg-pearl border border-divider hover:bg-parchment text-ink-muted font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>ให้ AI สรุป</span>
            </button>
            <button
              onClick={() => setOpenArticle(null)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
            >
              ปิดหน้าต่าง
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};
