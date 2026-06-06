import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { schedulePersistPreferences } from "../lib/tauri/preferences";

function preferencesChanged(
  state: ReturnType<typeof useAppStore.getState>,
  prev: ReturnType<typeof useAppStore.getState>,
): boolean {
  return !(
    state.theme === prev.theme &&
    state.syncScroll === prev.syncScroll &&
    state.sidebarCollapsed === prev.sidebarCollapsed &&
    state.sidebarWidth === prev.sidebarWidth &&
    state.defaultViewMode === prev.defaultViewMode &&
    state.restoreLastFolderOnStartup === prev.restoreLastFolderOnStartup &&
    state.editorFontSize === prev.editorFontSize &&
    state.editorTabSize === prev.editorTabSize &&
    state.editorLineNumbers === prev.editorLineNumbers &&
    state.editorLineWrap === prev.editorLineWrap &&
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
    state.restoreLastFolderOnStartup !== prev.restoreLastFolderOnStartup ||
    state.editorTabSize !== prev.editorTabSize ||
    state.editorLineNumbers !== prev.editorLineNumbers ||
    state.editorLineWrap !== prev.editorLineWrap ||
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
