import { useEffect, useRef, useState } from "react";
import {
  SearchQuery,
  findNext,
  findPrevious,
  replaceAll,
  replaceNext,
  setSearchQuery,
} from "@codemirror/search";
import { useEditorStore } from "../../stores/editorStore";

export function FindReplace() {
  const open = useEditorStore((s) => s.findReplaceOpen);
  const setOpen = useEditorStore((s) => s.setFindReplaceOpen);
  const view = useEditorStore((s) => s.view);
  const findRef = useRef<HTMLInputElement>(null);

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchInfo, setMatchInfo] = useState("");

  const applyQuery = () => {
    if (!view) return null;
    const query = new SearchQuery({
      search: findText,
      replace: replaceText,
      caseSensitive: false,
    });
    view.dispatch({ effects: setSearchQuery.of(query) });
    return query;
  };

  const updateMatchInfo = () => {
    if (!view || !findText) {
      setMatchInfo("");
      return;
    }
    const cursor = view.state.selection.main.head;
    const matches = [];
    const q = applyQuery();
    if (!q) return;
    const text = view.state.doc.toString();
    const re = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push(m.index);
    }
    if (matches.length === 0) {
      setMatchInfo("No matches");
      return;
    }
    const currentIdx = matches.findIndex((pos) => pos >= cursor);
    const idx = currentIdx === -1 ? matches.length : currentIdx + 1;
    setMatchInfo(`${idx} of ${matches.length}`);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => findRef.current?.focus(), 0);
      updateMatchInfo();
    }
  }, [open]);

  useEffect(() => {
    updateMatchInfo();
  }, [findText, view]);

  if (!open) return null;

  const handleFindNext = () => {
    if (!view) return;
    applyQuery();
    findNext(view);
    updateMatchInfo();
  };

  const handleFindPrev = () => {
    if (!view) return;
    applyQuery();
    findPrevious(view);
    updateMatchInfo();
  };

  const handleReplace = () => {
    if (!view) return;
    applyQuery();
    replaceNext(view);
    updateMatchInfo();
  };

  const handleReplaceAll = () => {
    if (!view) return;
    applyQuery();
    replaceAll(view);
    updateMatchInfo();
  };

  return (
    <div className="find-overlay" onClick={() => setOpen(false)}>
      <div
        className="find-modal"
        role="dialog"
        aria-label="Find and Replace"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="find-header">
          <span>Find & Replace</span>
          <button className="find-close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <label className="find-row">
          <span>Find</span>
          <input
            ref={findRef}
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFindNext();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search..."
          />
        </label>

        <label className="find-row">
          <span>Replace</span>
          <input
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder="Replace with..."
          />
        </label>

        <div className="find-meta">{matchInfo}</div>

        <div className="find-actions">
          <button onClick={handleFindPrev}>↑ Prev</button>
          <button onClick={handleFindNext}>↓ Next</button>
          <button onClick={handleReplace}>Replace</button>
          <button onClick={handleReplaceAll}>Replace All</button>
        </div>
      </div>

      <style>{`
        .find-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 80px;
          z-index: 1000;
        }
        .find-modal {
          width: 420px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          padding: 16px;
        }
        .find-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
        }
        .find-close {
          border: none;
          background: transparent;
          font-size: 18px;
          color: var(--text-muted);
          padding: 0 4px;
        }
        .find-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .find-row span {
          width: 56px;
          color: var(--text-secondary);
        }
        .find-row input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
        }
        .find-meta {
          font-size: 11px;
          color: var(--text-muted);
          margin: 4px 0 12px 64px;
          min-height: 16px;
        }
        .find-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }
        .find-actions button {
          padding: 5px 12px;
          font-size: 12px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .find-actions button:hover {
          background: var(--bg-hover);
        }
      `}</style>
    </div>
  );
}
