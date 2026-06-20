import { useEditorStore } from "../../stores/editorStore";
import { getTabEditorView } from "../../lib/editor/tabEditorCache";
import { useAppStore } from "../../stores/appStore";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useEffect, useRef } from "react";

function DialogShell({
  open,
  label,
  onClose,
  children,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
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
        className="app-dialog app-dialog--wide ai-structure-diff-dialog"
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

export function AiStructureDiffDialog() {
  const open = useEditorStore((s) => s.aiStructureDiffOpen);
  const before = useEditorStore((s) => s.aiStructureBefore);
  const after = useEditorStore((s) => s.aiStructureAfter);
  const range = useEditorStore((s) => s.aiStructureRange);
  const setDiff = useEditorStore((s) => s.setAiStructureDiff);
  const storeView = useEditorStore((s) => s.view);
  const activeTabId = useAppStore((s) => s.activeTabId);

  const close = () => setDiff(false);

  const apply = () => {
    if (!range) {
      close();
      return;
    }

    const view =
      storeView ??
      (activeTabId ? getTabEditorView(activeTabId) : null) ??
      null;

    if (view) {
      view.dispatch({
        changes: { from: range.from, to: range.to, insert: after },
        selection: { anchor: range.from + after.length },
      });
      view.focus();
    }

    close();
  };

  return (
    <DialogShell open={open} label="AI Structure preview" onClose={close}>
      <div className="app-dialog-header">
        <h3 className="app-dialog-title">AI Structure preview</h3>
        <p className="app-dialog-desc">
          Review the proposed markdown before applying it to your document.
        </p>
      </div>
      <div className="ai-structure-diff-panels">
        <div className="ai-structure-diff-panel">
          <h4>Before</h4>
          <pre>{before}</pre>
        </div>
        <div className="ai-structure-diff-panel">
          <h4>After</h4>
          <pre>{after}</pre>
        </div>
      </div>
      <div className="app-dialog-actions">
        <button type="button" className="app-dialog-btn" onClick={close}>
          Reject
        </button>
        <button
          type="button"
          className="app-dialog-btn app-dialog-btn--primary"
          onClick={apply}
        >
          Accept
        </button>
      </div>
      <style>{`
        .ai-structure-diff-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          max-height: 50vh;
          overflow: hidden;
        }
        .ai-structure-diff-panel {
          display: flex;
          flex-direction: column;
          min-width: 0;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .ai-structure-diff-panel h4 {
          margin: 0;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 600;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .ai-structure-diff-panel pre {
          margin: 0;
          padding: 10px;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 12px;
          line-height: 1.5;
          flex: 1;
        }
      `}</style>
    </DialogShell>
  );
}
