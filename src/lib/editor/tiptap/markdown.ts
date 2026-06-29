import type { Editor } from "@tiptap/core";
import { preparePreservedBlocks } from "./preservePatterns";

interface MarkdownStorage {
  getMarkdown(): string;
}

const HIGHLIGHT_MD_PATTERN = /==([^=\n]+?)==/g;
const HIGHLIGHT_HTML_PATTERN = /<mark>([\s\S]*?)<\/mark>/gi;
const SUPERSCRIPT_MD_PATTERN = /\^(?!\s)([^^\n]*?\S)\^(?!\^)/g;
const SUBSCRIPT_MD_PATTERN = /~(?!~)(?!\s)([^~\n]*?\S)~(?!~)/g;
const SUPERSCRIPT_HTML_PATTERN = /<sup>([\s\S]*?)<\/sup>/gi;
const SUBSCRIPT_HTML_PATTERN = /<sub>([\s\S]*?)<\/sub>/gi;

/** Prepare markdown body for Tiptap import (custom syntax + preserved widgets). */
export function prepareTiptapBody(body: string): string {
  let text = preparePreservedBlocks(body);
  text = text.replace(HIGHLIGHT_MD_PATTERN, "<mark>$1</mark>");
  text = text.replace(SUPERSCRIPT_MD_PATTERN, "<sup>$1</sup>");
  text = text.replace(SUBSCRIPT_MD_PATTERN, "<sub>$1</sub>");
  return text;
}

/** Restore md-editor dialect after Tiptap markdown export. */
export function finalizeTiptapMarkdown(markdown: string): string {
  let text = markdown;
  text = text.replace(HIGHLIGHT_HTML_PATTERN, "==$1==");
  text = text.replace(SUPERSCRIPT_HTML_PATTERN, "^$1^");
  text = text.replace(SUBSCRIPT_HTML_PATTERN, "~$1~");
  return text;
}

export function getTiptapMarkdown(editor: Editor): string {
  const storage = editor.storage as { markdown?: MarkdownStorage };
  const raw = storage.markdown?.getMarkdown() ?? editor.getText();
  return finalizeTiptapMarkdown(raw);
}
