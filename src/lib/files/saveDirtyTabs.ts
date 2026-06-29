import { message } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "../../stores/appStore";
import { syncActiveTabContentFromEditor } from "../editor/getEditorContent";
import { confirmSaveDespiteInvalidSyntax } from "./saveStructured";
import { defaultExtensionForKind, type FileKind } from "./fileKind";
import { pickSaveFile, writeFile } from "../tauri/commands";
import { refreshTreeIfUnderRoot } from "../tauri/refreshTree";

function defaultSaveName(title: string, fileKind: FileKind): string {
  const slug = title.replace(/\s+/g, "-").toLowerCase() || "untitled";
  return `${slug}.${defaultExtensionForKind(fileKind)}`;
}

export async function saveDirtyTab(tabId: string): Promise<boolean> {
  syncActiveTabContentFromEditor();
  const store = useAppStore.getState();
  store.setActiveTab(tabId);
  syncActiveTabContentFromEditor();

  const tab = useAppStore.getState().tabs.find((item) => item.id === tabId);
  if (!tab || !tab.isDirty) return true;

  if (!(await confirmSaveDespiteInvalidSyntax(tab.fileKind, tab.content))) {
    return false;
  }

  const path = tab.path?.trim();
  if (path) {
    try {
      await writeFile(path, tab.content);
      store.markTabSaved(tabId);
      return true;
    } catch (err) {
      await message(String(err), { title: "Save Failed", kind: "error" });
      return false;
    }
  }

  const savePath = await pickSaveFile(
    defaultSaveName(tab.title, tab.fileKind),
    tab.fileKind,
  );
  if (!savePath) return false;

  try {
    await writeFile(savePath, tab.content);
    store.updateTabAfterSave(tabId, savePath);
    await refreshTreeIfUnderRoot(savePath);
    return true;
  } catch (err) {
    await message(String(err), { title: "Save Failed", kind: "error" });
    return false;
  }
}

export async function saveAllDirtyTabs(): Promise<boolean> {
  syncActiveTabContentFromEditor();
  const dirtyTabIds = useAppStore
    .getState()
    .tabs.filter((tab) => tab.isDirty)
    .map((tab) => tab.id);

  for (const tabId of dirtyTabIds) {
    const saved = await saveDirtyTab(tabId);
    if (!saved) return false;
  }

  return true;
}
