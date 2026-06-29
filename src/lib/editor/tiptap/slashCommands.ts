import type { Editor } from "@tiptap/core";
import { applyTiptapFormatAction } from "../tiptapFormatActions";

export interface SlashCommand {
  id: string;
  label: string;
  hint?: string;
  keywords: string[];
  run: (editor: Editor) => boolean;
}

const TABLE_TEMPLATE_ROWS = 3;
const TABLE_TEMPLATE_COLS = 3;

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "paragraph",
    label: "Paragraph",
    hint: "Turn into body text",
    keywords: ["paragraph", "body", "text", "p"],
    run: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: "heading1",
    label: "Heading 1",
    keywords: ["heading", "h1", "title"],
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "heading2",
    label: "Heading 2",
    keywords: ["heading", "h2", "subtitle"],
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "heading3",
    label: "Heading 3",
    keywords: ["heading", "h3"],
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: "bulletList",
    label: "Bullet list",
    keywords: ["bullet", "list", "ul"],
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "numberedList",
    label: "Numbered list",
    keywords: ["numbered", "ordered", "ol"],
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "taskList",
    label: "Task list",
    keywords: ["task", "todo", "checkbox"],
    run: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: "blockquote",
    label: "Blockquote",
    keywords: ["quote", "blockquote"],
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: "codeBlock",
    label: "Code block",
    keywords: ["code", "fence"],
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "table",
    label: "Table",
    keywords: ["table", "grid"],
    run: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({
          rows: TABLE_TEMPLATE_ROWS,
          cols: TABLE_TEMPLATE_COLS,
          withHeaderRow: true,
        })
        .run(),
  },
  {
    id: "horizontalRule",
    label: "Divider",
    keywords: ["hr", "divider", "rule"],
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: "calloutNote",
    label: "Callout — Note",
    keywords: ["callout", "alert", "note"],
    run: (editor) => applyTiptapFormatAction(editor, "calloutNote"),
  },
  {
    id: "mathBlock",
    label: "Math block",
    keywords: ["math", "latex", "equation"],
    run: (editor) => applyTiptapFormatAction(editor, "mathBlock"),
  },
];

export function filterSlashCommands(query: string): SlashCommand[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return SLASH_COMMANDS;

  return SLASH_COMMANDS.filter((command) => {
    if (command.id.includes(normalized)) return true;
    if (command.label.toLowerCase().includes(normalized)) return true;
    return command.keywords.some((keyword) => keyword.includes(normalized));
  });
}

export function getSlashQuery(editor: Editor): {
  query: string;
  range: { from: number; to: number };
} | null {
  const { selection } = editor.state;
  const { $from } = selection;
  const textBefore = $from.parent.textBetween(
    0,
    $from.parentOffset,
    undefined,
    "\ufffc",
  );
  const slashIndex = textBefore.lastIndexOf("/");
  if (slashIndex < 0) return null;

  const beforeSlash = textBefore.slice(0, slashIndex);
  if (beforeSlash.length > 0 && !/\s$/.test(beforeSlash)) return null;

  const query = textBefore.slice(slashIndex + 1);
  if (/\s/.test(query)) return null;

  const from = $from.start() + slashIndex;
  const to = selection.from;
  return { query, range: { from, to } };
}

export function runSlashCommand(editor: Editor, command: SlashCommand): boolean {
  const slash = getSlashQuery(editor);
  if (slash) {
    editor.chain().focus().deleteRange(slash.range).run();
  }
  return command.run(editor);
}
