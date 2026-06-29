import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { schedulePersistPreferences } from "../lib/tauri/preferences";
import { syntaxCustomColorsKey } from "../lib/editor/syntaxColors";

function preferencesChanged(
  state: ReturnType<typeof useAppStore.getState>,
  prev: ReturnType<typeof useAppStore.getState>,
): boolean {
  return !(
    state.colorScheme === prev.colorScheme &&
    state.theme === prev.theme &&
    state.syncScroll === prev.syncScroll &&
    state.sidebarCollapsed === prev.sidebarCollapsed &&
    state.sidebarWidth === prev.sidebarWidth &&
    state.defaultViewMode === prev.defaultViewMode &&
    state.defaultEditMode === prev.defaultEditMode &&
    state.restoreLastFolderOnStartup === prev.restoreLastFolderOnStartup &&
    state.folderTreeExpansion === prev.folderTreeExpansion &&
    state.editorFontSize === prev.editorFontSize &&
    state.previewFontSize === prev.previewFontSize &&
    state.editorTabSize === prev.editorTabSize &&
    state.editorLineNumbers === prev.editorLineNumbers &&
    state.editorLineWrap === prev.editorLineWrap &&
    state.editorSyntaxColors === prev.editorSyntaxColors &&
    syntaxCustomColorsKey(state.editorSyntaxCustomColors) ===
      syntaxCustomColorsKey(prev.editorSyntaxCustomColors) &&
    state.exportPdfTheme === prev.exportPdfTheme &&
    state.exportPdfPageSize === prev.exportPdfPageSize
  );
}

function persistDelay(
  state: ReturnType<typeof useAppStore.getState>,
  prev: ReturnType<typeof useAppStore.getState>,
): number {
  if (
    state.defaultViewMode !== prev.defaultViewMode ||
    state.defaultEditMode !== prev.defaultEditMode ||
    state.restoreLastFolderOnStartup !== prev.restoreLastFolderOnStartup ||
    state.folderTreeExpansion !== prev.folderTreeExpansion ||
    state.editorTabSize !== prev.editorTabSize ||
    state.editorLineNumbers !== prev.editorLineNumbers ||
    state.editorLineWrap !== prev.editorLineWrap ||
    state.editorSyntaxColors !== prev.editorSyntaxColors ||
    state.editorSyntaxCustomColors !== prev.editorSyntaxCustomColors ||
    state.exportPdfTheme !== prev.exportPdfTheme ||
    state.exportPdfPageSize !== prev.exportPdfPageSize
  ) {
    return 0;
  }
  return 300;
}

export function usePersistPreferences() {
  useEffect(() => {
    const unsub = useAppStore.subscribe((state, prev) => {
      if (!preferencesChanged(state, prev)) return;
      schedulePersistPreferences(persistDelay(state, prev));
    });

    return () => unsub();
  }, []);
}
