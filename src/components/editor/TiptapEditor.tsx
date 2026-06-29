import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useAppStore } from "../../stores/appStore";
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
import { TiptapBubbleMenu } from "./TiptapBubbleMenu";
import { TiptapFrontmatterBanner } from "./TiptapFrontmatterBanner";
import "../../styles/tiptap.css";
import "../../styles/tiptap-bubble.css";
import "../../styles/tiptap-preserved.css";

interface TiptapEditorProps {
  tabId: string;
  content: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ tabId, content, onChange }: TiptapEditorProps) {
  const onChangeRef = useRef(onChange);
  const documentRef = useRef(splitDocumentContent(content));
  const editorFontSize = useAppStore((s) => s.editorFontSize);

  const { body, frontmatterPrefix } = useMemo(
    () => splitDocumentContent(content),
    [content],
  );
  const editorBody = useMemo(() => prepareTiptapBody(body), [body]);

  onChangeRef.current = onChange;

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
    editor.setOptions({
      editorProps: {
        attributes: {
          class: "tiptap",
          style: `font-size: ${editorFontSize}px`,
        },
      },
    });
  }, [editor, editorFontSize]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    requestAnimationFrame(() => editor.commands.focus("end"));
  }, [editor, tabId]);

  if (!editor) {
    return (
      <div className="tiptap-editor-shell markdown-editor">
        <TiptapFrontmatterBanner content={content} />
        <div className="tiptap-editor-root" />
      </div>
    );
  }

  return (
    <div className="tiptap-editor-shell markdown-editor">
      <TiptapFrontmatterBanner content={content} />
      <div className="tiptap-editor-root">
        <EditorContent editor={editor} />
        <TiptapBubbleMenu editor={editor} />
      </div>
    </div>
  );
}
