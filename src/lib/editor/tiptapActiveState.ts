import type { Editor } from "@tiptap/core";
import type { InlineFormatId, ListFormatId } from "./formatActiveState";
import type { HeadingLevelValue } from "./headingLevel";

export function getTiptapHeadingLevel(editor: Editor): HeadingLevelValue {
  for (let level = 1; level <= 6; level += 1) {
    if (editor.isActive("heading", { level })) {
      return `heading${level}` as HeadingLevelValue;
    }
  }
  return "body";
}

export function getTiptapInlineActiveState(
  editor: Editor,
): Record<InlineFormatId, boolean> {
  return {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    code: editor.isActive("code"),
    highlight: editor.isActive("highlight"),
    strikethrough: editor.isActive("strike"),
  };
}

export function getTiptapListActiveState(
  editor: Editor,
): Record<ListFormatId, boolean> {
  return {
    bulletList: editor.isActive("bulletList"),
    numberedList: editor.isActive("orderedList"),
    taskList: editor.isActive("taskList"),
    blockquote: editor.isActive("blockquote"),
  };
}
