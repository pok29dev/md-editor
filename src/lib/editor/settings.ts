import { useAppStore } from "../../stores/appStore";

export interface EditorSettings {
  fontSize: number;
  tabSize: 2 | 4;
  lineNumbers: boolean;
  lineWrap: boolean;
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
  };
}

export function editorSettingsKey(
  isDark: boolean,
  settings: EditorSettings,
): string {
  return `${isDark}:${settings.fontSize}:${settings.tabSize}:${settings.lineNumbers}:${settings.lineWrap}`;
}
