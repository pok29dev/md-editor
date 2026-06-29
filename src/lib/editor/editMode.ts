import type { FileKind } from "../files/fileKind";
import { supportsPreview } from "../files/fileKind";
import type { ViewMode } from "../../stores/appStore";

export type EditMode = "wysiwyg" | "source";

export const DEFAULT_EDIT_MODE: EditMode = "source";

export function normalizeEditMode(value: unknown): EditMode {
  return value === "wysiwyg" ? "wysiwyg" : "source";
}

export function shouldUseWysiwyg(
  viewMode: ViewMode,
  editMode: EditMode,
  fileKind: FileKind,
): boolean {
  return supportsPreview(fileKind) && viewMode === "editor" && editMode === "wysiwyg";
}
