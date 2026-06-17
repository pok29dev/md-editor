import { useCallback } from "react";
import { useAppStore } from "../stores/appStore";
import { confirmCloseTabWithoutSaving } from "../lib/dialogs/unsavedChanges";
import { syncActiveTabContentFromEditor } from "../lib/editor/getEditorContent";

export function useTabActions() {
  const closeTab = useAppStore((s) => s.closeTab);
  const closeAllTabs = useAppStore((s) => s.closeAllTabs);
  const closeOtherTabs = useAppStore((s) => s.closeOtherTabs);

  const tryCloseTab = useCallback(
    async (id: string): Promise<boolean> => {
      const tab = useAppStore.getState().tabs.find((t) => t.id === id);
      if (!tab) return false;

      if (tab.isDirty) {
        const confirmed = await confirmCloseTabWithoutSaving(tab.title);
        if (!confirmed) return false;
      }

      closeTab(id);
      return true;
    },
    [closeTab],
  );

  const hasDirtyTabs = useCallback(
    () => useAppStore.getState().tabs.some((t) => t.isDirty),
    [],
  );

  const tryCloseAllTabs = useCallback(async (): Promise<boolean> => {
    syncActiveTabContentFromEditor();
    const tabs = useAppStore.getState().tabs;

    for (const tab of tabs) {
      if (tab.isDirty) {
        const confirmed = await confirmCloseTabWithoutSaving(tab.title);
        if (!confirmed) return false;
      }
    }

    closeAllTabs();
    return true;
  }, [closeAllTabs]);

  const tryCloseOtherTabs = useCallback(
    async (keepId: string): Promise<boolean> => {
      syncActiveTabContentFromEditor();
      const others = useAppStore
        .getState()
        .tabs.filter((t) => t.id !== keepId);
      if (others.length === 0) return true;

      for (const tab of others) {
        if (tab.isDirty) {
          const confirmed = await confirmCloseTabWithoutSaving(tab.title);
          if (!confirmed) return false;
        }
      }

      closeOtherTabs(keepId);
      return true;
    },
    [closeOtherTabs],
  );

  return { tryCloseTab, tryCloseAllTabs, tryCloseOtherTabs, hasDirtyTabs };
}
