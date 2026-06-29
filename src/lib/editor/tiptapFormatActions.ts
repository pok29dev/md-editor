import type { Editor } from "@tiptap/core";
import type { FormatActionId, FormatContext } from "./formatActions";
import { getTiptapMarkdown } from "./tiptap/markdown";

const TABLE_TEMPLATE_ROWS = 3;
const TABLE_TEMPLATE_COLS = 3;

const CALLOUT_TYPES: Partial<Record<FormatActionId, string>> = {
  calloutNote: "NOTE",
  calloutTip: "TIP",
  calloutImportant: "IMPORTANT",
  calloutWarning: "WARNING",
  calloutCaution: "CAUTION",
};

function insertPreservedBlock(
  editor: Editor,
  kind: string,
  raw: string,
): boolean {
  return editor
    .chain()
    .focus()
    .insertContent({
      type: "preservedMarkdown",
      attrs: { kind, raw },
    })
    .run();
}

function nextFootnoteId(doc: string): string {
  const matches = doc.match(/\[\^([^\]]+)\]/g) ?? [];
  const ids = matches
    .map((match) => match.slice(2, -1))
    .filter((id) => /^\d+$/.test(id))
    .map(Number);
  return String(ids.length > 0 ? Math.max(...ids) + 1 : 1);
}

export function applyTiptapFormatAction(
  editor: Editor,
  actionId: FormatActionId,
  context: FormatContext = {},
): boolean {
  const chain = editor.chain().focus();

  switch (actionId) {
    case "heading1":
      return chain.toggleHeading({ level: 1 }).run();
    case "heading2":
      return chain.toggleHeading({ level: 2 }).run();
    case "heading3":
      return chain.toggleHeading({ level: 3 }).run();
    case "heading4":
      return chain.toggleHeading({ level: 4 }).run();
    case "heading5":
      return chain.toggleHeading({ level: 5 }).run();
    case "heading6":
      return chain.toggleHeading({ level: 6 }).run();
    case "body":
      return chain.setParagraph().run();
    case "bold":
      return chain.toggleBold().run();
    case "italic":
      return chain.toggleItalic().run();
    case "code":
      return chain.toggleCode().run();
    case "highlight":
      return chain.toggleHighlight().run();
    case "strikethrough":
      return chain.toggleStrike().run();
    case "blockquote":
      return chain.toggleBlockquote().run();
    case "bulletList":
      return chain.toggleBulletList().run();
    case "numberedList":
      return chain.toggleOrderedList().run();
    case "taskList":
      return chain.toggleTaskList().run();
    case "horizontalRule":
      return chain.setHorizontalRule().run();
    case "codeBlock":
      return chain.toggleCodeBlock().run();
    case "table":
      return chain.insertTable({
        rows: TABLE_TEMPLATE_ROWS,
        cols: TABLE_TEMPLATE_COLS,
        withHeaderRow: true,
      }).run();
    case "link": {
      const url = context.url?.trim();
      if (!url) return false;
      const text = context.linkText?.trim();
      if (text) {
        return chain.insertContent(`[${text}](${url})`).run();
      }
      return chain.extendMarkRange("link").setLink({ href: url }).run();
    }
    case "image": {
      const path = context.imagePath?.trim();
      if (!path) return false;
      const alt = context.imageAlt?.trim() || "image";
      return chain.setImage({ src: path, alt }).run();
    }
    case "mathBlock":
      return insertPreservedBlock(editor, "math-block", "$$\n\n$$");
    case "footnote": {
      const id = nextFootnoteId(getTiptapMarkdown(editor));
      chain.insertContent(`[^${id}]`).run();
      return insertPreservedBlock(
        editor,
        "footnote-def",
        `[^${id}]: footnote text`,
      );
    }
    default: {
      const calloutType = CALLOUT_TYPES[actionId];
      if (calloutType) {
        const raw = `> [!${calloutType}]\n> \n`;
        return insertPreservedBlock(
          editor,
          `alert-${calloutType.toLowerCase()}`,
          raw,
        );
      }
      return false;
    }
  }
}

export function canTiptapUndo(editor: Editor): boolean {
  return editor.can().undo();
}

export function canTiptapRedo(editor: Editor): boolean {
  return editor.can().redo();
}

export function runTiptapUndo(editor: Editor): boolean {
  return editor.chain().focus().undo().run();
}

export function runTiptapRedo(editor: Editor): boolean {
  return editor.chain().focus().redo().run();
}
