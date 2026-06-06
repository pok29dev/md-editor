import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { runFormatAction } from "../../hooks/useMarkdownFormat";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export function LinkDialog() {
  const open = useEditorStore((s) => s.linkDialogOpen);
  const setOpen = useEditorStore((s) => s.setLinkDialogOpen);
  const view = useEditorStore((s) => s.view);
  const modalRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");

  useFocusTrap(modalRef, open);

  useEffect(() => {
    if (!open) return;

    const selection = view?.state.selection.main;
    const selected =
      selection && selection.from !== selection.to
        ? view?.state.sliceDoc(selection.from, selection.to) ?? ""
        : "";

    setUrl("https://");
    setLinkText(selected);
    requestAnimationFrame(() => {
      urlRef.current?.focus();
      urlRef.current?.select();
    });
  }, [open, view]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  const submit = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setOpen(false);
      return;
    }

    runFormatAction("linkPrompt", {
      url: trimmedUrl,
      linkText: linkText.trim() || undefined,
    });
    setOpen(false);
  };

  return (
    <div className="link-overlay" onClick={() => setOpen(false)}>
      <div
        ref={modalRef}
        className="link-dialog"
        role="dialog"
        aria-label="Insert link"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="link-header">
          <span>Insert Link</span>
          <button
            type="button"
            className="link-close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <label className="link-row">
          <span>URL</span>
          <input
            ref={urlRef}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
              if (event.key === "Escape") setOpen(false);
            }}
            placeholder="https://"
            spellCheck={false}
          />
        </label>

        <label className="link-row">
          <span>Text</span>
          <input
            type="text"
            value={linkText}
            onChange={(event) => setLinkText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
              if (event.key === "Escape") setOpen(false);
            }}
            placeholder="Link label (optional)"
          />
        </label>

        <p className="link-hint">
          Leave text empty to use the selected word or &quot;link text&quot;.
        </p>

        <div className="link-actions">
          <button type="button" className="link-btn link-btn--ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" className="link-btn link-btn--primary" onClick={submit}>
            Insert
          </button>
        </div>
      </div>

      <style>{`
        .link-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 80px;
          z-index: 1000;
        }
        .link-dialog {
          width: 420px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          padding: 16px;
        }
        .link-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
        }
        .link-close {
          border: none;
          background: transparent;
          font-size: 18px;
          color: var(--text-muted);
          padding: 0 4px;
          cursor: pointer;
        }
        .link-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .link-row span {
          width: 40px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .link-row input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
        }
        .link-hint {
          margin: 4px 0 12px 48px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .link-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }
        .link-btn {
          padding: 5px 12px;
          font-size: 12px;
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
        }
        .link-btn--ghost {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .link-btn--primary {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }
        .link-btn:hover {
          filter: brightness(0.96);
        }
      `}</style>
    </div>
  );
}
