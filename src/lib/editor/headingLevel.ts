import type { EditorView } from "@codemirror/view";

export type HeadingLevelValue =
  | "body"
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6";

const HEADING_LINE_PATTERN = /^(#{1,6})\s+/;

export function headingLevelFromLine(lineText: string): HeadingLevelValue {
  const match = lineText.match(HEADING_LINE_PATTERN);
  if (!match) return "body";

  const level = Math.min(match[1].length, 6);
  return `heading${level}` as HeadingLevelValue;
}

export function getHeadingLevelAtCursor(view: EditorView): HeadingLevelValue {
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);
  return headingLevelFromLine(line.text);
}
