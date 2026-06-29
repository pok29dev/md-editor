import { useCallback } from "react";
import { useAppStore } from "../stores/appStore";
import { promptCloseTabWithUnsavedChanges } from "../lib/dialogs/unsavedChanges";
import { saveDirtyTab } from "../lib/files/saveDirtyTabs";
import { syncActiveTabContentFromEditor } from "../lib/editor/getEditorContent";

export function useTabActions() {
  const closeTab = useAppStore((s) => s.closeTab);
  const closeAllTabs = useAppStore((s) => s.closeAllTabs);
  const closeOtherTabs = useAppStore((s) => s.closeOtherTabs);

  const tryCloseDirtyTab = useCallback(async (id: string): Promise<boolean> => {
    const tab = useAppStore.getState().tabs.find((item) => item.id === id);
    if (!tab) return false;

    if (!tab.isDirty) return true;

    const choice = await promptCloseTabWithUnsavedChanges(tab.title);
    if (choice === "cancel") return false;
    if (choice === "save") {
      return saveDirtyTab(id);
    }
    return true;
  }, []);

  const tryCloseTab = useCallback(
    async (id: string): Promise<boolean> => {
      const canClose = await tryCloseDirtyTab(id);
      if (!canClose) return false;
      closeTab(id);
      return true;
    },
    [closeTab, tryCloseDirtyTab],
  );

  const hasDirtyTabs = useCallback(
    () => useAppStore.getState().tabs.some((t) => t.isDirty),
    [],
  );

  const tryCloseAllTabs = useCallback(async (): Promise<boolean> => {
    syncActiveTabContentFromEditor();
    const tabs = [...useAppStore.getState().tabs];

    for (const tab of tabs) {
      const canClose = await tryCloseDirtyTab(tab.id);
      if (!canClose) return false;
    }

    closeAllTabs();
    return true;
  }, [closeAllTabs, tryCloseDirtyTab]);

  const tryCloseOtherTabs = useCallback(
    async (keepId: string): Promise<boolean> => {
      syncActiveTabContentFromEditor();
      const others = useAppStore
        .getState()
        .tabs.filter((t) => t.id !== keepId);
      if (others.length === 0) return true;

      for (const tab of others) {
        const canClose = await tryCloseDirtyTab(tab.id);
        if (!canClose) return false;
      }

      closeOtherTabs(keepId);
      return true;
    },
    [closeOtherTabs, tryCloseDirtyTab],
  );

  return { tryCloseTab, tryCloseAllTabs, tryCloseOtherTabs, hasDirtyTabs };
}
