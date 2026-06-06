import type { EditorView } from "@codemirror/view";

const BULLET_LIST_PATTERN = /^[-*+]\s+/;
const NUMBERED_LIST_PATTERN = /^\d+\.\s+/;
const TASK_LIST_PATTERN = /^-\s+\[[ xX]\]\s+/;

const INLINE_WRAP_ACTIONS = {
  bold: { before: "**", after: "**" },
  italic: { before: "*", after: "*" },
  code: { before: "`", after: "`" },
  highlight: { before: "==", after: "==" },
  strikethrough: { before: "~~", after: "~~" },
} as const;

export type InlineFormatId = keyof typeof INLINE_WRAP_ACTIONS;
export type ListFormatId = "bulletList" | "numberedList" | "taskList";

function expandToWordIfEmpty(
  view: EditorView,
  from: number,
  to: number,
): { from: number; to: number } {
  if (from !== to) return { from, to };

  const word = view.state.wordAt(from);
  if (word && word.from < word.to) {
    return { from: word.from, to: word.to };
  }

  return { from, to };
}

function markerConflictAt(
  doc: string,
  from: number,
  to: number,
  before: string,
  after: string,
): boolean {
  if (before === "*" && after === "*") {
    const openStart = from - before.length;
    if (openStart > 0 && doc.slice(openStart - 1, openStart + 1) === "**") {
      return true;
    }
    const closeEnd = to + after.length;
    if (closeEnd + 1 <= doc.length && doc.slice(closeEnd - 1, closeEnd + 1) === "**") {
      return true;
    }
  }

  return false;
}

function isAdjacentWrap(
  doc: string,
  from: number,
  to: number,
  before: string,
  after: string,
): boolean {
  if (from < before.length || to + after.length > doc.length) return false;
  if (doc.slice(from - before.length, from) !== before) return false;
  if (doc.slice(to, to + after.length) !== after) return false;
  return !markerConflictAt(doc, from, to, before, after);
}

function isSelectionIncludingWrap(
  selected: string,
  before: string,
  after: string,
): boolean {
  return (
    selected.length >= before.length + after.length &&
    selected.startsWith(before) &&
    selected.endsWith(after)
  );
}

function isWrapActiveAtSelection(
  view: EditorView,
  before: string,
  after: string,
): boolean {
  const doc = view.state.doc.toString();
  const { from, to } = view.state.selection.main;

  if (from !== to) {
    const selected = view.state.sliceDoc(from, to);
    if (isSelectionIncludingWrap(selected, before, after)) {
      return true;
    }
  }

  const expanded = expandToWordIfEmpty(view, from, to);
  return isAdjacentWrap(doc, expanded.from, expanded.to, before, after);
}

export function isInlineFormatActive(
  view: EditorView,
  id: InlineFormatId,
): boolean {
  const { before, after } = INLINE_WRAP_ACTIONS[id];
  return isWrapActiveAtSelection(view, before, after);
}

export function isListFormatActive(view: EditorView, id: ListFormatId): boolean {
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos).text;

  switch (id) {
    case "bulletList":
      return BULLET_LIST_PATTERN.test(line) && !TASK_LIST_PATTERN.test(line);
    case "numberedList":
      return NUMBERED_LIST_PATTERN.test(line);
    case "taskList":
      return TASK_LIST_PATTERN.test(line);
  }
}

export function getInlineActiveState(
  view: EditorView,
): Record<InlineFormatId, boolean> {
  return {
    bold: isInlineFormatActive(view, "bold"),
    italic: isInlineFormatActive(view, "italic"),
    code: isInlineFormatActive(view, "code"),
    highlight: isInlineFormatActive(view, "highlight"),
    strikethrough: isInlineFormatActive(view, "strikethrough"),
  };
}

export function getListActiveState(
  view: EditorView,
): Record<ListFormatId, boolean> {
  return {
    bulletList: isListFormatActive(view, "bulletList"),
    numberedList: isListFormatActive(view, "numberedList"),
    taskList: isListFormatActive(view, "taskList"),
  };
}
