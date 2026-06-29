import { message } from "@tauri-apps/plugin-dialog";

export const SAVE = "Save";
export const QUIT_WITHOUT_SAVING = "Quit Without Saving";
export const CLOSE_WITHOUT_SAVING = "Close Without Saving";
const CANCEL = "Cancel";

export type UnsavedChoice = "save" | "discard" | "cancel";

function parseUnsavedChoice(
  result: string,
  saveLabel: string,
  discardLabel: string,
): UnsavedChoice {
  if (result === saveLabel) return "save";
  if (result === discardLabel) return "discard";
  return "cancel";
}

export async function promptQuitWithUnsavedChanges(): Promise<UnsavedChoice> {
  const result = await message("Some files have unsaved changes.", {
    title: "Unsaved Changes",
    kind: "warning",
    buttons: {
      yes: SAVE,
      no: QUIT_WITHOUT_SAVING,
      cancel: CANCEL,
    },
  });
  return parseUnsavedChoice(result, SAVE, QUIT_WITHOUT_SAVING);
}

export async function promptCloseTabWithUnsavedChanges(
  tabTitle: string,
): Promise<UnsavedChoice> {
  const result = await message(`"${tabTitle}" has unsaved changes.`, {
    title: "Unsaved Changes",
    kind: "warning",
    buttons: {
      yes: SAVE,
      no: CLOSE_WITHOUT_SAVING,
      cancel: CANCEL,
    },
  });
  return parseUnsavedChoice(result, SAVE, CLOSE_WITHOUT_SAVING);
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
