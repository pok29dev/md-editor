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
    <div className="app-dialog-overlay" onClick={() => setOpen(false)}>
      <div
        ref={modalRef}
        className="app-dialog"
        role="dialog"
        aria-label="Insert link"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-dialog-header">
          <span>Insert Link</span>
          <button
            type="button"
            className="app-dialog-close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <label className="app-dialog-field app-dialog-field--narrow">
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

        <label className="app-dialog-field app-dialog-field--narrow">
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

        <p className="app-dialog-hint app-dialog-hint--narrow">
          Leave text empty to use the selected word or &quot;link text&quot;.
        </p>

        <div className="app-dialog-actions">
          <button
            type="button"
            className="app-dialog-btn"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="app-dialog-btn app-dialog-btn--primary"
            onClick={submit}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
