import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEditorStore } from "../../stores/editorStore";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import {
  resolveUnsavedChangesDialog,
  SAVE,
  type UnsavedChoice,
} from "../../lib/dialogs/unsavedChanges";

function finishUnsavedChoice(choice: UnsavedChoice): void {
  resolveUnsavedChangesDialog(choice);
  void getCurrentWindow().setFocus().catch(() => {});
}

export function UnsavedChangesDialog() {
  const dialog = useEditorStore((s) => s.unsavedChangesDialog);
  const modalRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(modalRef, dialog.open);

  useEffect(() => {
    if (!dialog.open) return;

    requestAnimationFrame(() => {
      saveRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishUnsavedChoice("cancel");
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog.open]);

  if (!dialog.open) return null;

  return (
    <div
      className="app-dialog-overlay app-dialog-overlay--unsaved"
      role="presentation"
    >
      <div
        ref={modalRef}
        className="app-dialog app-dialog--unsaved"
        role="alertdialog"
        aria-labelledby="unsaved-dialog-title"
        aria-describedby="unsaved-dialog-message"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-dialog-header">
          <span id="unsaved-dialog-title">Unsaved Changes</span>
        </div>

        <p id="unsaved-dialog-message" className="app-dialog-message">
          {dialog.message}
        </p>

        <div className="app-dialog-actions">
          <button
            type="button"
            className="app-dialog-btn"
            onClick={() => finishUnsavedChoice("cancel")}
          >
            Cancel
          </button>
          <button
            type="button"
            className="app-dialog-btn app-dialog-btn--danger"
            onClick={() => finishUnsavedChoice("discard")}
          >
            {dialog.discardLabel}
          </button>
          <button
            ref={saveRef}
            type="button"
            className="app-dialog-btn app-dialog-btn--primary"
            onClick={() => finishUnsavedChoice("save")}
          >
            {SAVE}
          </button>
        </div>
      </div>
    </div>
  );
}
