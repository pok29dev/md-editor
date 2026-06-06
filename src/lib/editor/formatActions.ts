import { EditorSelection } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

export type FormatActionId =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "body"
  | "bold"
  | "italic"
  | "code"
  | "highlight"
  | "strikethrough"
  | "mathInline"
  | "comment"
  | "link"
  | "linkPrompt"
  | "calloutNote"
  | "calloutTip"
  | "calloutImportant"
  | "calloutWarning"
  | "calloutCaution"
  | "codeBlock"
  | "mathBlock"
  | "table"
  | "footnote"
  | "bulletList"
  | "numberedList"
  | "taskList"
  | "image";

export interface FormatContext {
  url?: string;
  imagePath?: string;
  linkText?: string;
  imageAlt?: string;
}

const HEADING_PREFIX_PATTERN = /^#{1,6}\s+/;
const BULLET_LIST_PATTERN = /^[-*+]\s+/;
const NUMBERED_LIST_PATTERN = /^\d+\.\s+/;
const TASK_LIST_PATTERN = /^-\s+\[[ xX]\]\s+/;

const WRAP_MARKERS: Partial<
  Record<FormatActionId, { before: string; after: string; placeholder?: string }>
> = {
  bold: { before: "**", after: "**", placeholder: "text" },
  italic: { before: "*", after: "*", placeholder: "text" },
  code: { before: "`", after: "`", placeholder: "code" },
  highlight: { before: "==", after: "==", placeholder: "text" },
  strikethrough: { before: "~~", after: "~~", placeholder: "text" },
  mathInline: { before: "$", after: "$", placeholder: "x" },
  comment: { before: "<!-- ", after: " -->", placeholder: "comment" },
};

const CALLOUT_ACTIONS: Partial<Record<FormatActionId, string>> = {
  calloutNote: "NOTE",
  calloutTip: "TIP",
  calloutImportant: "IMPORTANT",
  calloutWarning: "WARNING",
  calloutCaution: "CAUTION",
};

const TABLE_TEMPLATE = `| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| cell     | cell     | cell     |
`;

interface LineRange {
  from: number;
  to: number;
  text: string;
}

export function wrapText(
  text: string,
  before: string,
  after: string,
  placeholder = "",
): { result: string; selectionStart: number; selectionEnd: number } {
  const content = text || placeholder;
  const result = `${before}${content}${after}`;
  const selectionStart = before.length;
  const selectionEnd = selectionStart + content.length;
  return { result, selectionStart, selectionEnd };
}

export function transformLinePrefix(
  lineText: string,
  prefix: string,
  removePattern?: RegExp,
): string {
  const stripped = removePattern
    ? lineText.replace(removePattern, "")
    : lineText;
  return `${prefix}${stripped}`;
}

export function toggleLinePrefixText(
  lineText: string,
  prefix: string,
  activePattern: RegExp,
  stripPatterns: RegExp[] = [],
): string {
  if (activePattern.test(lineText)) {
    return lineText.replace(activePattern, "");
  }

  let next = lineText;
  for (const pattern of stripPatterns) {
    next = next.replace(pattern, "");
  }
  return `${prefix}${next}`;
}

function getLineRanges(view: EditorView): LineRange[] {
  const { from, to } = view.state.selection.main;
  const startLine = view.state.doc.lineAt(from);
  const endLine = view.state.doc.lineAt(to);
  const ranges: LineRange[] = [];

  for (let lineNo = startLine.number; lineNo <= endLine.number; lineNo += 1) {
    const line = view.state.doc.line(lineNo);
    ranges.push({
      from: line.from,
      to: line.to,
      text: line.text,
    });
  }

  return ranges;
}

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

  if (before === "$" && after === "$") {
    const openStart = from - before.length;
    if (openStart > 0 && doc.slice(openStart - 1, openStart + 1) === "$$") {
      return true;
    }
    const closeEnd = to + after.length;
    if (closeEnd + 1 <= doc.length && doc.slice(closeEnd - 1, closeEnd + 1) === "$$") {
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

function wrapSelection(
  view: EditorView,
  before: string,
  after: string,
  placeholder = "",
): void {
  const doc = view.state.doc.toString();
  let { from, to } = expandToWordIfEmpty(view, view.state.selection.main.from, view.state.selection.main.to);
  let selected = view.state.sliceDoc(from, to);

  if (isSelectionIncludingWrap(selected, before, after)) {
    const innerFrom = from + before.length;
    const innerTo = to - after.length;
    const inner = view.state.sliceDoc(innerFrom, innerTo);
    view.dispatch({
      changes: { from, to, insert: inner },
      selection: EditorSelection.single(from, from + inner.length),
    });
    view.focus();
    return;
  }

  if (isAdjacentWrap(doc, from, to, before, after)) {
    const wrapFrom = from - before.length;
    const wrapTo = to + after.length;
    view.dispatch({
      changes: { from: wrapFrom, to: wrapTo, insert: selected },
      selection: EditorSelection.single(wrapFrom, wrapFrom + selected.length),
    });
    view.focus();
    return;
  }

  const wrapped = wrapText(selected, before, after, placeholder);
  const selectionStart = from + wrapped.selectionStart;
  const selectionEnd = from + wrapped.selectionEnd;

  view.dispatch({
    changes: { from, to, insert: wrapped.result },
    selection: EditorSelection.single(selectionStart, selectionEnd),
  });
  view.focus();
}

function applyLinePrefix(
  view: EditorView,
  prefix: string,
  removePattern?: RegExp,
): void {
  const lines = getLineRanges(view);
  const changes = lines
    .map((line) => ({
      from: line.from,
      to: line.to,
      insert: transformLinePrefix(line.text, prefix, removePattern),
    }))
    .reverse();

  if (changes.length === 0) return;

  const firstLine = lines[0];
  const anchor = firstLine.from + prefix.length;

  view.dispatch({
    changes,
    selection: EditorSelection.single(anchor),
  });
  view.focus();
}

function toggleLinePrefix(
  view: EditorView,
  prefix: string,
  activePattern: RegExp,
  stripPatterns: RegExp[] = [],
): void {
  const lines = getLineRanges(view);
  const changes = lines
    .map((line) => ({
      from: line.from,
      to: line.to,
      insert: toggleLinePrefixText(
        line.text,
        prefix,
        activePattern,
        stripPatterns,
      ),
    }))
    .reverse();

  if (changes.length === 0) return;

  view.dispatch({ changes });
  view.focus();
}

function insertBlock(
  view: EditorView,
  template: string,
  cursorOffset: number,
): void {
  const { from, to } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const atLineEnd = from === line.to;
  const onEmptyLine = line.text.length === 0;

  let insert = template;
  let offset = cursorOffset;

  if (!onEmptyLine && (atLineEnd || from > line.from)) {
    insert = `\n${template}`;
    offset += 1;
  }

  view.dispatch({
    changes: { from, to, insert },
    selection: EditorSelection.single(from + offset),
  });
  view.focus();
}

function setHeadingLevel(view: EditorView, level: number): void {
  const prefix = `${"#".repeat(level)} `;
  applyLinePrefix(view, prefix, HEADING_PREFIX_PATTERN);
}

function setBody(view: EditorView): void {
  applyLinePrefix(view, "", HEADING_PREFIX_PATTERN);
}

function insertLink(view: EditorView, url: string, linkText?: string): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const label = linkText ?? (selected || "link text");
  const insert = `[${label}](${url})`;

  view.dispatch({
    changes: { from, to, insert },
    selection: EditorSelection.single(from + insert.length),
  });
  view.focus();
}

function insertImage(view: EditorView, path: string, alt?: string): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const label = alt ?? (selected || "image");
  const insert = `![${label}](${path})`;

  view.dispatch({
    changes: { from, to, insert },
    selection: EditorSelection.single(from + insert.length),
  });
  view.focus();
}

function insertCallout(view: EditorView, type: string): void {
  const prefix = `> [!${type}]\n> `;
  insertBlock(view, `${prefix}\n`, prefix.length);
}

function insertCodeBlock(view: EditorView): void {
  insertBlock(view, "```\n\n```", 4);
}

function insertMathBlock(view: EditorView): void {
  insertBlock(view, "$$\n\n$$", 3);
}

function insertTable(view: EditorView): void {
  insertBlock(view, `${TABLE_TEMPLATE}\n`, TABLE_TEMPLATE.length);
}

function nextFootnoteId(doc: string): string {
  const matches = doc.match(/\[\^([^\]]+)\]/g) ?? [];
  const ids = matches
    .map((match) => match.slice(2, -1))
    .filter((id) => /^\d+$/.test(id))
    .map(Number);
  const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  return String(next);
}

function insertFootnote(view: EditorView): void {
  const { from, to } = view.state.selection.main;
  const doc = view.state.doc.toString();
  const id = nextFootnoteId(doc);
  const ref = `[^${id}]`;
  const definition = `\n\n[^${id}]: footnote text\n`;

  view.dispatch({
    changes: [
      { from, to, insert: ref },
      { from: doc.length, insert: definition },
    ],
    selection: EditorSelection.single(from + ref.length),
  });
  view.focus();
}

function insertPlainLink(view: EditorView): void {
  insertLink(view, "https://");
}

export function applyFormatAction(
  view: EditorView,
  actionId: FormatActionId,
  context: FormatContext = {},
): boolean {
  const wrap = WRAP_MARKERS[actionId];
  if (wrap) {
    wrapSelection(view, wrap.before, wrap.after, wrap.placeholder);
    return true;
  }

  switch (actionId) {
    case "heading1":
      setHeadingLevel(view, 1);
      return true;
    case "heading2":
      setHeadingLevel(view, 2);
      return true;
    case "heading3":
      setHeadingLevel(view, 3);
      return true;
    case "heading4":
      setHeadingLevel(view, 4);
      return true;
    case "heading5":
      setHeadingLevel(view, 5);
      return true;
    case "heading6":
      setHeadingLevel(view, 6);
      return true;
    case "body":
      setBody(view);
      return true;
    case "link":
      insertPlainLink(view);
      return true;
    case "linkPrompt":
      insertLink(view, context.url ?? "https://", context.linkText);
      return true;
    case "codeBlock":
      insertCodeBlock(view);
      return true;
    case "mathBlock":
      insertMathBlock(view);
      return true;
    case "table":
      insertTable(view);
      return true;
    case "footnote":
      insertFootnote(view);
      return true;
    case "bulletList":
      toggleLinePrefix(view, "- ", BULLET_LIST_PATTERN, [
        HEADING_PREFIX_PATTERN,
        NUMBERED_LIST_PATTERN,
        TASK_LIST_PATTERN,
      ]);
      return true;
    case "numberedList":
      toggleLinePrefix(view, "1. ", NUMBERED_LIST_PATTERN, [
        HEADING_PREFIX_PATTERN,
        BULLET_LIST_PATTERN,
        TASK_LIST_PATTERN,
      ]);
      return true;
    case "taskList":
      toggleLinePrefix(view, "- [ ] ", TASK_LIST_PATTERN, [
        HEADING_PREFIX_PATTERN,
        BULLET_LIST_PATTERN,
        NUMBERED_LIST_PATTERN,
      ]);
      return true;
    case "image":
      if (!context.imagePath) return false;
      insertImage(view, context.imagePath, context.imageAlt);
      return true;
    default: {
      const calloutType = CALLOUT_ACTIONS[actionId];
      if (calloutType) {
        insertCallout(view, calloutType);
        return true;
      }
      return false;
    }
  }
}

export function canApplyFormatAction(
  actionId: FormatActionId,
  context: FormatContext = {},
): boolean {
  if (actionId === "image") return Boolean(context.imagePath);
  if (actionId === "linkPrompt") return Boolean(context.url);
  return true;
}
