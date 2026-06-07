import { useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { useAppStore } from "../../stores/appStore";
import { useEditorStore } from "../../stores/editorStore";
import {
  editorSettingsKey,
  getEditorSettingsFromStore,
} from "../../lib/editor/settings";
import {
  attachTabEditor,
  recreateTabEditor,
  setTabEditorChangeHandler,
  syncTabEditorContent,
} from "../../lib/editor/tabEditorCache";

interface MarkdownEditorProps {
  tabId: string;
  content: string;
  onChange: (content: string) => void;
}

export function MarkdownEditor({ tabId, content, onChange }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const mountKeyRef = useRef("");
  const resolvedColorScheme = useAppStore((s) => s.resolvedColorScheme);
  const editorFontSize = useAppStore((s) => s.editorFontSize);
  const editorTabSize = useAppStore((s) => s.editorTabSize);
  const editorLineNumbers = useAppStore((s) => s.editorLineNumbers);
  const editorLineWrap = useAppStore((s) => s.editorLineWrap);
  const setView = useEditorStore((s) => s.setView);

  onChangeRef.current = onChange;

  useEffect(() => {
    setTabEditorChangeHandler((value) => onChangeRef.current(value));
  });

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    let active = true;

    const mount = (): boolean => {
      if (!active || parent.clientWidth === 0) return false;

      const isDark = resolvedColorScheme === "dark";
      const settings = getEditorSettingsFromStore();
      const mountKey = editorSettingsKey(isDark, settings);
      const configChanged = mountKeyRef.current !== mountKey;
      mountKeyRef.current = mountKey;

      const view = configChanged
        ? recreateTabEditor(parent, tabId, content, isDark, settings)
        : attachTabEditor(parent, tabId, content, isDark, settings);

      setView(view);
      requestAnimationFrame(() => view.requestMeasure());
      return true;
    };

    let mountObserver: ResizeObserver | null = null;
    if (!mount()) {
      mountObserver = new ResizeObserver(() => {
        if (mount()) {
          mountObserver?.disconnect();
          mountObserver = null;
        }
      });
      mountObserver.observe(parent);
    }

    const measureObserver = new ResizeObserver(() => {
      const dom = parent.querySelector(".cm-editor");
      const view = dom instanceof HTMLElement ? EditorView.findFromDOM(dom) : null;
      view?.requestMeasure();
    });
    measureObserver.observe(parent);

    return () => {
      active = false;
      mountObserver?.disconnect();
      measureObserver.disconnect();
    };
  }, [
    tabId,
    resolvedColorScheme,
    editorFontSize,
    editorTabSize,
    editorLineNumbers,
    editorLineWrap,
    setView,
  ]);

  useEffect(() => {
    return () => setView(null);
  }, [setView]);

  useEffect(() => {
    syncTabEditorContent(tabId, content);
  }, [tabId, content]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    requestAnimationFrame(() => {
      const dom = parent.querySelector(".cm-editor");
      const view = dom instanceof HTMLElement ? EditorView.findFromDOM(dom) : null;
      view?.focus();
    });
  }, [tabId]);

  return <div ref={containerRef} className="markdown-editor" />;
}
