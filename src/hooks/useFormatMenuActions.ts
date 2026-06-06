import type { FormatActionId, FormatContext } from "../lib/editor/formatActions";
import { openLinkDialog } from "../stores/editorStore";
import { pickOpenImage } from "../lib/tauri/commands";
import { runFormatAction } from "./useMarkdownFormat";

export function runFormatFromMenu(
  actionId: FormatActionId,
  context: FormatContext = {},
): void {
  runFormatAction(actionId, context);
}

export function openMarkdownLinkDialog(): void {
  openLinkDialog();
}

export async function insertImageFromMenu(): Promise<void> {
  const path = await pickOpenImage();
  if (!path) return;
  runFormatAction("image", { imagePath: path });
}
