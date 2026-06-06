import type { DialogFilter } from "@tauri-apps/plugin-dialog";

/** Shared file-dialog filters — includes All Files for macOS UTType compatibility. */
export const MARKDOWN_DIALOG_FILTERS: DialogFilter[] = [
  { name: "Markdown", extensions: ["md", "markdown", "mdown", "mkd", "mdx"] },
  { name: "All Files", extensions: ["*"] },
];
