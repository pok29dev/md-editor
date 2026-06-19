import { message } from "@tauri-apps/plugin-dialog";
import type { FileKind } from "./fileKind";
import { validateStructuredContent } from "./validateStructured";

const SAVE_ANYWAY = "Save Anyway";
const CANCEL = "Cancel";

export async function confirmSaveDespiteInvalidSyntax(
  kind: FileKind,
  content: string,
): Promise<boolean> {
  const result = validateStructuredContent(kind, content);
  if (result.valid) return true;

  const answer = await message(
    `This file has syntax errors:\n\n${result.message}\n\nSave anyway?`,
    {
      title: "Invalid Syntax",
      kind: "warning",
      buttons: { ok: SAVE_ANYWAY, cancel: CANCEL },
    },
  );
  return answer === SAVE_ANYWAY;
}
