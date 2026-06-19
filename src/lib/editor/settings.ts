import { useAppStore } from "../../stores/appStore";
import type { FileKind } from "../files/fileKind";
import {
  syntaxCustomColorsKey,
  type EditorSyntaxColorScheme,
  type EditorSyntaxCustomColors,
} from "./syntaxColors";

export type { EditorSyntaxColorScheme, EditorSyntaxCustomColors, SyntaxColorPalette, SyntaxColorToken } from "./syntaxColors";

export interface EditorSettings {
  fontSize: number;
  tabSize: 2 | 4;
  lineNumbers: boolean;
  lineWrap: boolean;
  syntaxColors: EditorSyntaxColorScheme;
  syntaxCustomColors: EditorSyntaxCustomColors;
}

export const EDITOR_FONT_SIZE_MIN = 12;
export const EDITOR_FONT_SIZE_MAX = 20;
export const EDITOR_FONT_SIZE_DEFAULT = 14;
export const EDITOR_TAB_SIZE_DEFAULT = 2;

export function clampEditorFontSize(size: number): number {
  return Math.min(
    EDITOR_FONT_SIZE_MAX,
    Math.max(EDITOR_FONT_SIZE_MIN, Math.round(size)),
  );
}

export function normalizeEditorTabSize(size: number): 2 | 4 {
  return size === 4 ? 4 : 2;
}

export function getEditorSettingsFromStore(): EditorSettings {
  const state = useAppStore.getState();
  return {
    fontSize: state.editorFontSize,
    tabSize: state.editorTabSize,
    lineNumbers: state.editorLineNumbers,
    lineWrap: state.editorLineWrap,
    syntaxColors: state.editorSyntaxColors,
    syntaxCustomColors: state.editorSyntaxCustomColors,
  };
}

export function editorSettingsKey(
  isDark: boolean,
  settings: EditorSettings,
  fileKind: FileKind = "markdown",
): string {
  return `${fileKind}:${isDark}:${settings.syntaxColors}:${syntaxCustomColorsKey(settings.syntaxCustomColors)}:${settings.fontSize}:${settings.tabSize}:${settings.lineNumbers}:${settings.lineWrap}`;
}

export {
  EDITOR_SYNTAX_COLORS_DEFAULT,
  DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS,
  normalizeEditorSyntaxColors,
  normalizeEditorSyntaxCustomColors,
} from "./syntaxColors";
