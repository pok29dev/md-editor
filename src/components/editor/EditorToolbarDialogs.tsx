import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { useEditorStore } from "../../stores/editorStore";
import { runFormatAction } from "../../hooks/useMarkdownFormat";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { EMOJI_PRESETS, SYMBOL_PRESETS } from "../../lib/editor/pickerPresets";
import { MarkdownHelpView } from "./MarkdownHelpView";
import markdownHelpContent from "../../../markdown-help.md?raw";

function DialogShell({
  open,
  label,
  onClose,
  children,
  wide = false,
  help = false,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  help?: boolean;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="app-dialog-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`app-dialog${wide ? " app-dialog--wide" : ""}${help ? " app-dialog--help" : ""}`}
        role="dialog"
        aria-label={label}
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ClearDocumentDialog() {
  const open = useEditorStore((s) => s.clearDocumentOpen);
  const setOpen = useEditorStore((s) => s.setClearDocumentOpen);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const updateTabContent = useAppStore((s) => s.updateTabContent);

  const confirm = () => {
    if (activeTabId) updateTabContent(activeTabId, "");
    setOpen(false);
  };

  return (
    <DialogShell open={open} label="Clear document" onClose={() => setOpen(false)}>
      <div className="app-dialog-header">
        <span>Clear document?</span>
        <button type="button" className="app-dialog-close" aria-label="Close" onClick={() => setOpen(false)}>
          ×
        </button>
      </div>
      <p className="app-dialog-hint">This removes all content from the active document. This cannot be undone.</p>
      <div className="app-dialog-actions">
        <button type="button" className="app-dialog-btn" onClick={() => setOpen(false)}>Cancel</button>
        <button type="button" className="app-dialog-btn app-dialog-btn--danger" onClick={confirm}>Clear</button>
      </div>
    </DialogShell>
  );
}

export function EmojiPickerDialog() {
  const open = useEditorStore((s) => s.emojiPickerOpen);
  const setOpen = useEditorStore((s) => s.setEmojiPickerOpen);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJI_PRESETS;
    return EMOJI_PRESETS.filter((item) => item.shortcode.includes(q));
  }, [query]);

  const insert = (shortcode: string) => {
    runFormatAction("emoji", { emojiShortcode: shortcode });
    setOpen(false);
  };

  return (
    <DialogShell open={open} label="Insert emoji" onClose={() => setOpen(false)} wide>
      <div className="app-dialog-header">
        <span>Insert emoji</span>
        <button type="button" className="app-dialog-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      </div>
      <input
        className="toolbar-picker-search"
        type="search"
        placeholder="Search shortcodes…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="toolbar-picker-grid" role="listbox" aria-label="Emoji shortcodes">
        {filtered.map(({ shortcode, label }) => (
          <button
            key={shortcode}
            type="button"
            className="toolbar-picker-item"
            title={`:${shortcode}:`}
            onClick={() => insert(shortcode)}
          >
            <span className="toolbar-picker-preview">{label}</span>
            <span className="toolbar-picker-meta">:{shortcode}:</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <p className="app-dialog-hint">No emojis found.</p>}
    </DialogShell>
  );
}

export function SymbolsPickerDialog() {
  const open = useEditorStore((s) => s.symbolsPickerOpen);
  const setOpen = useEditorStore((s) => s.setSymbolsPickerOpen);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SYMBOL_PRESETS;
    return SYMBOL_PRESETS.filter(
      (item) =>
        item.name.includes(q) ||
        item.entity.toLowerCase().includes(q) ||
        item.symbol.includes(q),
    );
  }, [query]);

  const insert = (symbolText: string) => {
    runFormatAction("symbol", { symbolText });
    setOpen(false);
  };

  return (
    <DialogShell open={open} label="Insert symbol" onClose={() => setOpen(false)} wide>
      <div className="app-dialog-header">
        <span>Insert symbol</span>
        <button type="button" className="app-dialog-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      </div>
      <input
        className="toolbar-picker-search"
        type="search"
        placeholder="Search symbols…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="toolbar-picker-grid toolbar-picker-grid--symbols" role="listbox" aria-label="Symbols">
        {filtered.map((item) => (
          <button
            key={`${item.entity}-${item.name}`}
            type="button"
            className="toolbar-picker-item"
            title={item.name}
            onClick={() => insert(item.entity)}
          >
            <span className="toolbar-picker-preview">{item.symbol}</span>
            <span className="toolbar-picker-meta">{item.entity}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <p className="app-dialog-hint">No symbols found.</p>}
    </DialogShell>
  );
}

function nextReferenceSuggestion(doc: string): number {
  const used = new Set<number>();
  const defPattern = /^\[(\d+)\]:\s+/gm;
  const inlinePattern = /\[(\d+)\](?!\s*:)/g;
  let match: RegExpExecArray | null;
  while ((match = defPattern.exec(doc)) !== null) used.add(Number(match[1]));
  while ((match = inlinePattern.exec(doc)) !== null) used.add(Number(match[1]));
  let candidate = 1;
  while (used.has(candidate)) candidate += 1;
  return candidate;
}

export function ReferenceDialog() {
  const open = useEditorStore((s) => s.referenceDialogOpen);
  const setOpen = useEditorStore((s) => s.setReferenceDialogOpen);
  const view = useEditorStore((s) => s.view);
  const [number, setNumber] = useState("1");
  const [url, setUrl] = useState("https://");
  const [title, setTitle] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const doc = view?.state.doc.toString() ?? "";
    setNumber(String(nextReferenceSuggestion(doc)));
    setUrl("https://");
    setTitle("");
    requestAnimationFrame(() => urlRef.current?.focus());
  }, [open, view]);

  const submit = () => {
    const parsed = parseInt(number.replace(/[^\d]/g, ""), 10);
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setOpen(false);
      return;
    }
    runFormatAction("reference", {
      referenceNumber: Number.isNaN(parsed) ? 1 : parsed,
      referenceUrl: trimmedUrl,
      referenceTitle: title.trim() || undefined,
    });
    setOpen(false);
  };

  return (
    <DialogShell open={open} label="Insert reference" onClose={() => setOpen(false)}>
      <div className="app-dialog-header">
        <span>Insert reference</span>
        <button type="button" className="app-dialog-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      </div>
      <label className="app-dialog-field app-dialog-field--narrow">
        <span>Ref #</span>
        <input
          type="text"
          value={`[${number}]`}
          onChange={(event) => setNumber(event.target.value.replace(/[^\d]/g, ""))}
        />
      </label>
      <label className="app-dialog-field app-dialog-field--narrow">
        <span>URL</span>
        <input
          ref={urlRef}
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />
      </label>
      <label className="app-dialog-field app-dialog-field--narrow">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="Optional"
        />
      </label>
      <div className="app-dialog-actions">
        <button type="button" className="app-dialog-btn" onClick={() => setOpen(false)}>Cancel</button>
        <button type="button" className="app-dialog-btn app-dialog-btn--primary" onClick={submit}>Insert</button>
      </div>
    </DialogShell>
  );
}

export function HelpDialog() {
  const open = useEditorStore((s) => s.helpDialogOpen);
  const setOpen = useEditorStore((s) => s.setHelpDialogOpen);

  return (
    <DialogShell
      open={open}
      label="Markdown syntax reference"
      onClose={() => setOpen(false)}
      wide
      help
    >
      <div className="app-dialog-header">
        <span>Markdown syntax reference</span>
        <button type="button" className="app-dialog-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      </div>
      {open && <MarkdownHelpView content={markdownHelpContent} />}
      <div className="app-dialog-actions app-dialog-actions--help">
        <button type="button" className="app-dialog-btn app-dialog-btn--primary" onClick={() => setOpen(false)}>Close</button>
      </div>
    </DialogShell>
  );
}

export function AboutDialog() {
  const open = useEditorStore((s) => s.aboutDialogOpen);
  const setOpen = useEditorStore((s) => s.setAboutDialogOpen);

  return (
    <DialogShell open={open} label="About Markdown" onClose={() => setOpen(false)} wide>
      <div className="app-dialog-header">
        <span>About Markdown</span>
        <button type="button" className="app-dialog-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      </div>
      <div className="toolbar-help-body">
        <p>
          MD Editor is a local-first Markdown editor with live preview, syntax formatting tools,
          math, diagrams, and export support.
        </p>
        <h3>Markdown tips</h3>
        <ul>
          <li>Headings: <code>#</code> through <code>######</code></li>
          <li>Emphasis: <code>**bold**</code>, <code>*italic*</code>, <code>~~strike~~</code></li>
          <li>Lists: <code>- item</code> or <code>1. item</code></li>
          <li>Code: inline with backticks or fenced blocks with triple backticks</li>
        </ul>
      </div>
      <div className="app-dialog-actions">
        <button type="button" className="app-dialog-btn app-dialog-btn--primary" onClick={() => setOpen(false)}>Close</button>
      </div>
    </DialogShell>
  );
}

export function EditorToolbarDialogs() {
  return (
    <>
      <ClearDocumentDialog />
      <EmojiPickerDialog />
      <SymbolsPickerDialog />
      <ReferenceDialog />
      <HelpDialog />
      <AboutDialog />
    </>
  );
}
