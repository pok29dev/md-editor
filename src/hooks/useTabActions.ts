import { useCallback } from "react";
import { useAppStore } from "../stores/appStore";
import { confirmCloseTabWithoutSaving } from "../lib/dialogs/unsavedChanges";

export function useTabActions() {
  const closeTab = useAppStore((s) => s.closeTab);

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

  return { tryCloseTab, hasDirtyTabs };
}
