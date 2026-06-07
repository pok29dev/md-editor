import { useAppStore } from "../../stores/appStore";
import { isToolbarDialogOpen, useEditorStore } from "../../stores/editorStore";

export function shouldHandleEditorFormatShortcut(event: KeyboardEvent): boolean {
  if (!event.metaKey && !event.ctrlKey) return false;

  const { settingsOpen } = useAppStore.getState();
  const { view } = useEditorStore.getState();

  if (settingsOpen || isToolbarDialogOpen()) return false;

  const target = event.target as HTMLElement | null;
  if (!target) return false;

  if (target.closest(".cm-content")) return true;

  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return false;
  }

  if (
    target.closest(".settings-modal") ||
    target.closest(".find-modal") ||
    target.closest(".link-dialog")
  ) {
    return false;
  }

  return view !== null;
}
