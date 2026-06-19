import type { DialogFilter } from "@tauri-apps/plugin-dialog";
import type { FileKind } from "../files/fileKind";

/** Shared file-dialog filters — includes All Files for macOS UTType compatibility. */
export const MARKDOWN_DIALOG_FILTERS: DialogFilter[] = [
  { name: "Markdown", extensions: ["md", "markdown", "mdown", "mkd", "mdx"] },
  { name: "All Files", extensions: ["*"] },
];

export const EDITABLE_DIALOG_FILTERS: DialogFilter[] = [
  { name: "Markdown", extensions: ["md", "markdown", "mdown", "mkd", "mdx"] },
  { name: "JSON", extensions: ["json"] },
  { name: "YAML", extensions: ["yaml", "yml"] },
  { name: "All Files", extensions: ["*"] },
];

export function saveDialogFiltersForKind(kind: FileKind): DialogFilter[] {
  switch (kind) {
    case "json":
      return [
        { name: "JSON", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ];
    case "yaml":
      return [
        { name: "YAML", extensions: ["yaml", "yml"] },
        { name: "All Files", extensions: ["*"] },
      ];
    default:
      return MARKDOWN_DIALOG_FILTERS;
  }
}
