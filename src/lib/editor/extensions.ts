import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  bracketMatching,
  HighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { highlightSelectionMatches } from "@codemirror/search";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { useEditorStore } from "../../stores/editorStore";
import type { EditorSettings } from "./settings";
import { createEditorTheme } from "./theme";

const editorHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, fontWeight: "bold" },
]);

export function buildEditorExtensions(
  isDark: boolean,
  settings: EditorSettings,
) {
  const openFind = () => {
    useEditorStore.getState().setFindReplaceOpen(true);
    return true;
  };

  const extensions = [
    highlightActiveLine(),
    bracketMatching(),
    syntaxHighlighting(editorHighlightStyle, {
      fallback: true,
    }),
    highlightSelectionMatches(),
    history(),
    indentUnit.of(" ".repeat(settings.tabSize)),
    markdown({ base: markdownLanguage }),
    createEditorTheme(isDark, settings.fontSize),
    keymap.of([
      { key: "Mod-f", run: openFind },
      indentWithTab,
      ...defaultKeymap,
      ...historyKeymap,
    ]),
  ];

  if (settings.lineNumbers) {
    extensions.unshift(highlightActiveLineGutter(), lineNumbers());
  }

  if (settings.lineWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  return extensions;
}
