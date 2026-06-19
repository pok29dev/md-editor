import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, indentUnit } from "@codemirror/language";
import { highlightSelectionMatches } from "@codemirror/search";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { useEditorStore } from "../../stores/editorStore";
import type { FileKind } from "../files/fileKind";
import type { EditorSettings } from "./settings";
import { buildSyntaxHighlightExtension } from "./syntaxColors";
import { createEditorTheme } from "./theme";

function languageExtension(fileKind: FileKind) {
  switch (fileKind) {
    case "json":
      return json();
    case "yaml":
      return yaml();
    default:
      return markdown({ base: markdownLanguage });
  }
}

export function buildEditorExtensions(
  isDark: boolean,
  settings: EditorSettings,
  fileKind: FileKind = "markdown",
) {
  const openFind = () => {
    useEditorStore.getState().setFindReplaceOpen(true);
    return true;
  };

  const extensions = [
    highlightActiveLine(),
    bracketMatching(),
    buildSyntaxHighlightExtension(
      fileKind,
      isDark,
      settings.syntaxColors,
      settings.syntaxCustomColors,
    ),
    highlightSelectionMatches(),
    history(),
    indentUnit.of(" ".repeat(settings.tabSize)),
    languageExtension(fileKind),
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
