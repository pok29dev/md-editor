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
    <div className="app-dialog-overlay" onClick={() => setOpen(false)}>
      <div
        className="app-dialog"
        role="dialog"
        aria-label="Find and Replace"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="app-dialog-header">
          <span>Find & Replace</span>
          <button
            type="button"
            className="app-dialog-close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <label className="app-dialog-field">
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

        <label className="app-dialog-field">
          <span>Replace</span>
          <input
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder="Replace with..."
          />
        </label>

        <div className="app-dialog-meta">{matchInfo}</div>

        <div className="app-dialog-actions">
          <button type="button" className="app-dialog-btn" onClick={handleFindPrev}>
            ↑ Prev
          </button>
          <button type="button" className="app-dialog-btn" onClick={handleFindNext}>
            ↓ Next
          </button>
          <button type="button" className="app-dialog-btn" onClick={handleReplace}>
            Replace
          </button>
          <button
            type="button"
            className="app-dialog-btn app-dialog-btn--primary"
            onClick={handleReplaceAll}
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
