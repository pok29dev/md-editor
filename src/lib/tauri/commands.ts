import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type {
  AppPreferences,
  FileContent,
  FolderTree,
} from "../../types/files";
import { EDITABLE_DIALOG_FILTERS, saveDialogFiltersForKind } from "./dialogFilters";
import type { FileKind } from "../files/fileKind";

export async function pickFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Open Folder",
  });
  if (selected === null || Array.isArray(selected)) return null;
  return selected;
}

export async function pickOpenEditableFile(
  defaultPath?: string | null,
): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    title: "Open File",
    defaultPath: defaultPath ?? undefined,
    filters: EDITABLE_DIALOG_FILTERS,
  });
  if (selected === null || Array.isArray(selected)) return null;
  return selected;
}

/** @deprecated Use pickOpenEditableFile */
export async function pickOpenMarkdown(
  defaultPath?: string | null,
): Promise<string | null> {
  return pickOpenEditableFile(defaultPath);
}

export async function pickSaveFile(
  defaultName = "untitled.md",
  kind: FileKind = "markdown",
): Promise<string | null> {
  const path = await save({
    defaultPath: defaultName,
    filters: saveDialogFiltersForKind(kind),
    title: "Save File",
  });
  return path;
}

/** @deprecated Use pickSaveFile */
export async function pickSaveMarkdown(
  defaultName = "untitled.md",
): Promise<string | null> {
  return pickSaveFile(defaultName, "markdown");
}

export async function pickSaveHtml(
  defaultName = "document.html",
): Promise<string | null> {
  const path = await save({
    defaultPath: defaultName,
    filters: [{ name: "HTML", extensions: ["html"] }],
    title: "Export HTML",
  });
  return path;
}

export function scanFolder(path: string): Promise<FolderTree> {
  return invoke<FolderTree>("scan_folder", { path });
}

export function readFile(path: string): Promise<FileContent> {
  return invoke<FileContent>("read_file", { path });
}

export function writeFile(path: string, content: string): Promise<void> {
  return invoke<void>("write_file", { path, content });
}

export function writeBinaryFile(path: string, data: Uint8Array): Promise<void> {
  return invoke<void>("write_binary_file", { path, data: Array.from(data) });
}

export async function pickOpenImage(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    title: "Insert Image",
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  if (selected === null || Array.isArray(selected)) return null;
  return selected;
}

export async function pickSavePdf(
  defaultName = "document.pdf",
): Promise<string | null> {
  const path = await save({
    defaultPath: defaultName,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
    title: "Export PDF",
  });
  return path;
}

export function getPreferences(): Promise<AppPreferences> {
  return invoke<AppPreferences>("get_preferences");
}

export function savePreferences(prefs: AppPreferences): Promise<void> {
  return invoke<void>("save_preferences", { prefs });
}

export function addRecentFolder(path: string): Promise<AppPreferences> {
  return invoke<AppPreferences>("add_recent_folder", { path });
}
