import type { EditorView } from "@codemirror/view";
import { normalizeMarkdown } from "../markdown/normalize/normalizeMarkdown";

export function applyNormalizeMarkdown(view: EditorView): boolean {
  const { from, to, anchor } = view.state.selection.main;
  const hasSelection = from !== to;

  if (hasSelection) {
    const selected = view.state.sliceDoc(from, to);
    const normalized = normalizeMarkdown(selected);
    if (normalized === selected) {
      view.focus();
      return true;
    }

    view.dispatch({
      changes: { from, to, insert: normalized },
      selection: { anchor: from + normalized.length },
    });
  } else {
    const full = view.state.doc.toString();
    const normalized = normalizeMarkdown(full);
    if (normalized === full) {
      view.focus();
      return true;
    }

    const nextAnchor = Math.min(anchor, normalized.length);
    view.dispatch({
      changes: { from: 0, to: full.length, insert: normalized },
      selection: { anchor: nextAnchor },
    });
  }

  view.focus();
  return true;
}
