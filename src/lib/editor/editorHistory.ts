import { redo, redoDepth, undo, undoDepth } from "@codemirror/commands";
import type { EditorView } from "@codemirror/view";

export function canEditorUndo(view: EditorView): boolean {
  return undoDepth(view.state) > 0;
}

export function canEditorRedo(view: EditorView): boolean {
  return redoDepth(view.state) > 0;
}

export function runEditorUndo(view: EditorView): boolean {
  return undo(view);
}

export function runEditorRedo(view: EditorView): boolean {
  return redo(view);
}
