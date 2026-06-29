import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { useAppStore } from "../../stores/appStore";
import { useEditorStore } from "../../stores/editorStore";
import { buildTiptapExtensions } from "../../lib/editor/tiptap/extensions";
import {
  getTiptapMarkdown,
  prepareTiptapBody,
} from "../../lib/editor/tiptap/markdown";
import {
  joinDocumentContent,
  splitDocumentContent,
} from "../../lib/editor/tiptap/documentContent";
import {
  registerTabTiptapEditor,
  unregisterTabTiptapEditor,
} from "../../lib/editor/tiptapTabCache";
import {
  canInsertImageFromClipboard,
  readImageFileFromDataTransfer,
  saveImageFileForInsert,
} from "../../lib/editor/tiptap/pasteImage";
import {
  useTiptapFocusMode,
  useTiptapTypewriterMode,
} from "../../lib/editor/tiptap/useTiptapEditorModes";
import { TiptapBubbleMenu } from "./TiptapBubbleMenu";
import { TiptapFrontmatterBanner } from "./TiptapFrontmatterBanner";
import { TiptapSlashMenu } from "./TiptapSlashMenu";
import "../../styles/tiptap.css";
import "../../styles/tiptap-bubble.css";
import "../../styles/tiptap-preserved.css";
import "../../styles/tiptap-slash.css";
import "../../styles/tiptap-modes.css";

interface TiptapEditorProps {
  tabId: string;
  content: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ tabId, content, onChange }: TiptapEditorProps) {
  const onChangeRef = useRef(onChange);
  const documentRef = useRef(splitDocumentContent(content));
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const editorFontSize = useAppStore((s) => s.editorFontSize);
  const rootFolder = useAppStore((s) => s.rootFolder);
  const documentPath = useAppStore(
    (s) => s.tabs.find((tab) => tab.id === tabId)?.path ?? null,
  );
  const editorFocusMode = useEditorStore((s) => s.editorFocusMode);
  const editorTypewriterMode = useEditorStore((s) => s.editorTypewriterMode);

  const { body, frontmatterPrefix } = useMemo(
    () => splitDocumentContent(content),
    [content],
  );
  const editorBody = useMemo(() => prepareTiptapBody(body), [body]);

  onChangeRef.current = onChange;

  const insertImageFromFile = useCallback(
    async (file: File, editorInstance: Editor) => {
      const target = await saveImageFileForInsert(
        file,
        documentPath,
        rootFolder,
      );
      if (!target) return false;

      editorInstance
        .chain()
        .focus()
        .setImage({ src: target.markdownPath, alt: "image" })
        .run();
      return true;
    },
    [documentPath, rootFolder],
  );

  const editor = useEditor(
    {
      extensions: buildTiptapExtensions(),
      content: editorBody,
      editorProps: {
        attributes: {
          class: "tiptap",
          style: `font-size: ${editorFontSize}px`,
        },
      },
      onUpdate: ({ editor: activeEditor }) => {
        const nextBody = getTiptapMarkdown(activeEditor);
        onChangeRef.current(
          joinDocumentContent(documentRef.current.frontmatterPrefix, nextBody),
        );
      },
    },
    [tabId],
  );

  useTiptapFocusMode(editor, editorFocusMode);
  useTiptapTypewriterMode(editor, scrollRoot, editorTypewriterMode);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class: "tiptap",
          style: `font-size: ${editorFontSize}px`,
        },
        handlePaste: (_view, event) => {
          if (!event.clipboardData) return false;
          const file = readImageFileFromDataTransfer(event.clipboardData);
          if (!file) return false;
          if (!canInsertImageFromClipboard(documentPath, rootFolder)) return false;
          event.preventDefault();
          void insertImageFromFile(file, editor);
          return true;
        },
        handleDrop: (_view, event) => {
          if (!event.dataTransfer) return false;
          const file = readImageFileFromDataTransfer(event.dataTransfer);
          if (!file) return false;
          if (!canInsertImageFromClipboard(documentPath, rootFolder)) return false;
          event.preventDefault();
          void insertImageFromFile(file, editor);
          return true;
        },
      },
    });
  }, [editor, editorFontSize, insertImageFromFile, documentPath, rootFolder]);

  useEffect(() => {
    documentRef.current = { frontmatterPrefix, body };
  }, [frontmatterPrefix, body]);

  useEffect(() => {
    if (!editor) return;
    registerTabTiptapEditor(tabId, editor);
    return () => {
      if (!editor.isDestroyed) {
        const nextBody = getTiptapMarkdown(editor);
        onChangeRef.current(
          joinDocumentContent(documentRef.current.frontmatterPrefix, nextBody),
        );
      }
      unregisterTabTiptapEditor(tabId, editor);
    };
  }, [editor, tabId]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = getTiptapMarkdown(editor);
    if (current !== body) {
      editor.commands.setContent(prepareTiptapBody(body), { emitUpdate: false });
    }
  }, [body, editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    requestAnimationFrame(() => editor.commands.focus("end"));
  }, [editor, tabId]);

  const shellClassName = [
    "tiptap-editor-shell",
    "markdown-editor",
    editorFocusMode ? "tiptap-focus-mode" : "",
    editorTypewriterMode ? "tiptap-typewriter-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!editor) {
    return (
      <div className={shellClassName}>
        <TiptapFrontmatterBanner content={content} />
        <div className="tiptap-editor-root" ref={setScrollRoot} />
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <TiptapFrontmatterBanner content={content} />
      <div className="tiptap-editor-root" ref={setScrollRoot}>
        <EditorContent editor={editor} />
        <TiptapBubbleMenu editor={editor} />
        <TiptapSlashMenu editor={editor} />
      </div>
    </div>
  );
}
