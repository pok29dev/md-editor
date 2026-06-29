import type { Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

export interface TextMatch {
  from: number;
  to: number;
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findTextMatches(
  editor: Editor,
  search: string,
  caseSensitive = false,
): TextMatch[] {
  if (!search) return [];

  const flags = caseSensitive ? "g" : "gi";
  const pattern = new RegExp(escapeRegExp(search), flags);
  const matches: TextMatch[] = [];
  const { doc } = editor.state;

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(node.text)) !== null) {
      const from = pos + match.index;
      matches.push({ from, to: from + match[0].length });
      if (match[0].length === 0) {
        pattern.lastIndex += 1;
      }
    }
  });

  return matches;
}

export function selectTextMatch(editor: Editor, match: TextMatch): void {
  const transaction = editor.state.tr
    .setSelection(TextSelection.create(editor.state.doc, match.from, match.to))
    .scrollIntoView();
  editor.view.dispatch(transaction);
  editor.commands.focus();
}

export function getCurrentMatchIndex(
  matches: TextMatch[],
  cursor: number,
): number {
  if (matches.length === 0) return 0;
  const index = matches.findIndex((match) => match.from >= cursor);
  if (index === -1) return matches.length;
  return index + 1;
}

export function findNextTextMatch(
  editor: Editor,
  search: string,
  caseSensitive = false,
): TextMatch | null {
  const matches = findTextMatches(editor, search, caseSensitive);
  if (matches.length === 0) return null;

  const cursor = editor.state.selection.from;
  return matches.find((match) => match.from >= cursor) ?? matches[0];
}

export function findPreviousTextMatch(
  editor: Editor,
  search: string,
  caseSensitive = false,
): TextMatch | null {
  const matches = findTextMatches(editor, search, caseSensitive);
  if (matches.length === 0) return null;

  const cursor = editor.state.selection.from;
  const previous = [...matches].reverse().find((match) => match.from < cursor);
  return previous ?? matches[matches.length - 1];
}

export function replaceSelectedMatch(
  editor: Editor,
  replaceText: string,
): boolean {
  const { from, to, empty } = editor.state.selection;
  if (empty) return false;

  editor.chain().focus().insertContentAt({ from, to }, replaceText).run();
  return true;
}

export function replaceAllTextMatches(
  editor: Editor,
  search: string,
  replaceText: string,
  caseSensitive = false,
): number {
  const matches = findTextMatches(editor, search, caseSensitive);
  if (matches.length === 0) return 0;

  let transaction = editor.state.tr;
  for (const match of [...matches].reverse()) {
    transaction = transaction.insertText(replaceText, match.from, match.to);
  }
  editor.view.dispatch(transaction);
  editor.commands.focus();
  return matches.length;
}
