import { message } from "@tauri-apps/plugin-dialog";

export const QUIT_WITHOUT_SAVING = "Quit Without Saving";
export const CLOSE_WITHOUT_SAVING = "Close Without Saving";
const CANCEL = "Cancel";

export async function confirmQuitWithoutSaving(): Promise<boolean> {
  const result = await message("Some files have unsaved changes.", {
    title: "Unsaved Changes",
    kind: "warning",
    buttons: { ok: QUIT_WITHOUT_SAVING, cancel: CANCEL },
  });
  return result === QUIT_WITHOUT_SAVING;
}

export async function confirmCloseTabWithoutSaving(
  tabTitle: string,
): Promise<boolean> {
  const result = await message(
    `"${tabTitle}" has unsaved changes.`,
    {
      title: "Unsaved Changes",
      kind: "warning",
      buttons: { ok: CLOSE_WITHOUT_SAVING, cancel: CANCEL },
    },
  );
  return result === CLOSE_WITHOUT_SAVING;
}
