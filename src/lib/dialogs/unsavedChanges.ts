import { useEditorStore } from "../../stores/editorStore";

export const SAVE = "Save";
export const QUIT_WITHOUT_SAVING = "Quit Without Saving";
export const CLOSE_WITHOUT_SAVING = "Close Without Saving";

export type UnsavedChoice = "save" | "discard" | "cancel";

let pendingResolve: ((choice: UnsavedChoice) => void) | null = null;

function showUnsavedDialog(
  message: string,
  discardLabel: string,
): Promise<UnsavedChoice> {
  return new Promise((resolve) => {
    pendingResolve = resolve;
    useEditorStore.getState().setUnsavedChangesDialog({
      open: true,
      message,
      discardLabel,
    });
  });
}

export function resolveUnsavedChangesDialog(choice: UnsavedChoice): void {
  useEditorStore.getState().setUnsavedChangesDialog({
    open: false,
    message: "",
    discardLabel: CLOSE_WITHOUT_SAVING,
  });

  const resolve = pendingResolve;
  pendingResolve = null;
  resolve?.(choice);
}

export async function promptQuitWithUnsavedChanges(): Promise<UnsavedChoice> {
  return showUnsavedDialog(
    "Some files have unsaved changes.",
    QUIT_WITHOUT_SAVING,
  );
}

export async function promptCloseTabWithUnsavedChanges(
  tabTitle: string,
): Promise<UnsavedChoice> {
  return showUnsavedDialog(
    `"${tabTitle}" has unsaved changes.`,
    CLOSE_WITHOUT_SAVING,
  );
}

/** @deprecated Use promptQuitWithUnsavedChanges */
export async function confirmQuitWithoutSaving(): Promise<boolean> {
  const choice = await promptQuitWithUnsavedChanges();
  return choice === "discard";
}

/** @deprecated Use promptCloseTabWithUnsavedChanges */
export async function confirmCloseTabWithoutSaving(
  tabTitle: string,
): Promise<boolean> {
  const choice = await promptCloseTabWithUnsavedChanges(tabTitle);
  return choice === "discard";
}
