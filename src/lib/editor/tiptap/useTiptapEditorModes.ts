import { useEffect } from "react";
import type { Editor } from "@tiptap/core";

const FOCUS_CLASS = "tiptap-block-focus";

function updateFocusBlock(editor: Editor, enabled: boolean): void {
  const root = editor.view.dom as HTMLElement;
  root.querySelectorAll(`.${FOCUS_CLASS}`).forEach((node) => {
    node.classList.remove(FOCUS_CLASS);
  });

  if (!enabled) return;

  const { from } = editor.state.selection;
  const resolved = editor.state.doc.resolve(from);
  for (let depth = resolved.depth; depth > 0; depth -= 1) {
    const node = resolved.node(depth);
    if (!node.isBlock) continue;
    const dom = editor.view.nodeDOM(resolved.before(depth));
    if (dom instanceof HTMLElement) {
      dom.classList.add(FOCUS_CLASS);
      return;
    }
  }
}

function scrollTypewriter(
  container: HTMLElement,
  editor: Editor,
): void {
  const { from } = editor.state.selection;
  const coords = editor.view.coordsAtPos(from);
  const containerRect = container.getBoundingClientRect();
  const cursorTop =
    coords.top - containerRect.top + container.scrollTop;
  const target =
    cursorTop - container.clientHeight / 2 + (coords.bottom - coords.top) / 2;

  container.scrollTo({
    top: Math.max(0, target),
    behavior: "smooth",
  });
}

export function useTiptapFocusMode(
  editor: Editor | null,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const update = () => updateFocusBlock(editor, enabled);
    update();
    editor.on("selectionUpdate", update);
    editor.on("focus", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("focus", update);
      updateFocusBlock(editor, false);
    };
  }, [editor, enabled]);
}

export function useTiptapTypewriterMode(
  editor: Editor | null,
  container: HTMLElement | null,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!editor || editor.isDestroyed || !container || !enabled) return;

    const update = () => scrollTypewriter(container, editor);
    update();
    editor.on("selectionUpdate", update);
    editor.on("focus", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("focus", update);
    };
  }, [editor, container, enabled]);
}
