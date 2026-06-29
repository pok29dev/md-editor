import { useAppStore, type EditMode } from "../stores/appStore";
import { DEFAULT_EDIT_MODE } from "../lib/editor/editMode";

export function useActiveEditMode(): EditMode {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  return tabs.find((t) => t.id === activeTabId)?.editMode ?? DEFAULT_EDIT_MODE;
}
