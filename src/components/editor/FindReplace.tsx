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
import { useFindReplaceEditor } from "../../hooks/useFindReplaceEditor";
import {
  findNextTextMatch,
  findPreviousTextMatch,
  findTextMatches,
  getCurrentMatchIndex,
  replaceAllTextMatches,
  replaceSelectedMatch,
  selectTextMatch,
} from "../../lib/editor/tiptap/findReplace";

export function FindReplace() {
  const open = useEditorStore((s) => s.findReplaceOpen);
  const setOpen = useEditorStore((s) => s.setFindReplaceOpen);
  const { kind, tiptap, codemirror } = useFindReplaceEditor();
  const findRef = useRef<HTMLInputElement>(null);

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchInfo, setMatchInfo] = useState("");

  const updateMatchInfo = () => {
    if (!findText) {
      setMatchInfo("");
      return;
    }

    if (kind === "codemirror" && codemirror) {
      const cursor = codemirror.state.selection.main.head;
      const text = codemirror.state.doc.toString();
      const re = new RegExp(
        findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi",
      );
      const matches: number[] = [];
      let match: RegExpExecArray | null;
      while ((match = re.exec(text)) !== null) {
        matches.push(match.index);
      }
      if (matches.length === 0) {
        setMatchInfo("No matches");
        return;
      }
      setMatchInfo(
        `${getCurrentMatchIndex(
          matches.map((from) => ({ from, to: from })),
          cursor,
        )} of ${matches.length}`,
      );
      return;
    }

    if (kind === "tiptap" && tiptap) {
      const matches = findTextMatches(tiptap, findText);
      if (matches.length === 0) {
        setMatchInfo("No matches");
        return;
      }
      setMatchInfo(
        `${getCurrentMatchIndex(matches, tiptap.state.selection.from)} of ${matches.length}`,
      );
      return;
    }

    setMatchInfo("No editor");
  };

  const applyCodemirrorQuery = () => {
    if (!codemirror) return null;
    const query = new SearchQuery({
      search: findText,
      replace: replaceText,
      caseSensitive: false,
    });
    codemirror.dispatch({ effects: setSearchQuery.of(query) });
    return query;
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => findRef.current?.focus(), 0);
      updateMatchInfo();
    }
  }, [open]);

  useEffect(() => {
    updateMatchInfo();
  }, [findText, kind, tiptap, codemirror]);

  if (!open) return null;

  const handleFindNext = () => {
    if (kind === "codemirror" && codemirror) {
      applyCodemirrorQuery();
      findNext(codemirror);
      updateMatchInfo();
      return;
    }

    if (kind === "tiptap" && tiptap) {
      const match = findNextTextMatch(tiptap, findText);
      if (match) selectTextMatch(tiptap, match);
      updateMatchInfo();
    }
  };

  const handleFindPrev = () => {
    if (kind === "codemirror" && codemirror) {
      applyCodemirrorQuery();
      findPrevious(codemirror);
      updateMatchInfo();
      return;
    }

    if (kind === "tiptap" && tiptap) {
      const match = findPreviousTextMatch(tiptap, findText);
      if (match) selectTextMatch(tiptap, match);
      updateMatchInfo();
    }
  };

  const handleReplace = () => {
    if (kind === "codemirror" && codemirror) {
      applyCodemirrorQuery();
      replaceNext(codemirror);
      updateMatchInfo();
      return;
    }

    if (kind === "tiptap" && tiptap) {
      if (!replaceSelectedMatch(tiptap, replaceText)) {
        const match = findNextTextMatch(tiptap, findText);
        if (match) {
          selectTextMatch(tiptap, match);
          replaceSelectedMatch(tiptap, replaceText);
        }
      }
      updateMatchInfo();
    }
  };

  const handleReplaceAll = () => {
    if (kind === "codemirror" && codemirror) {
      applyCodemirrorQuery();
      replaceAll(codemirror);
      updateMatchInfo();
      return;
    }

    if (kind === "tiptap" && tiptap) {
      replaceAllTextMatches(tiptap, findText, replaceText);
      updateMatchInfo();
    }
  };

  const editorHint =
    kind === "tiptap"
      ? "WYSIWYG"
      : kind === "codemirror"
        ? "Source"
        : "No active editor";

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

        <div className="app-dialog-meta">{editorHint}</div>

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
          <button
            type="button"
            className="app-dialog-btn"
            onClick={handleFindPrev}
            disabled={kind === "none"}
          >
            ↑ Prev
          </button>
          <button
            type="button"
            className="app-dialog-btn"
            onClick={handleFindNext}
            disabled={kind === "none"}
          >
            ↓ Next
          </button>
          <button
            type="button"
            className="app-dialog-btn"
            onClick={handleReplace}
            disabled={kind === "none"}
          >
            Replace
          </button>
          <button
            type="button"
            className="app-dialog-btn app-dialog-btn--primary"
            onClick={handleReplaceAll}
            disabled={kind === "none"}
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
