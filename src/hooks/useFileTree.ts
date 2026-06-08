import { useCallback } from "react";
import { useAppStore } from "../stores/appStore";
import {
  addRecentFolder,
  getPreferences,
  pickFolder,
  pickOpenMarkdown,
  readFile,
  scanFolder,
} from "../lib/tauri/commands";
import {
  persistPreferences,
  syncRecentFoldersFromPreferences,
} from "../lib/tauri/preferences";
import { isMarkdownPath } from "../lib/files/markdownExtensions";

function basename(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

function dirname(path: string): string {
  const parts = path.split(/[/\\]/);
  parts.pop();
  const sep = path.includes("\\") ? "\\" : "/";
  return parts.join(sep) || sep;
}

function isUnderRoot(filePath: string, root: string): boolean {
  const normalizedFile = filePath.replace(/\\/g, "/");
  const normalizedRoot = root.replace(/\\/g, "/").replace(/\/$/, "");
  return (
    normalizedFile === normalizedRoot ||
    normalizedFile.startsWith(`${normalizedRoot}/`)
  );
}

export function useFileTree() {
  const setRootFolder = useAppStore((s) => s.setRootFolder);
  const setFileTree = useAppStore((s) => s.setFileTree);
  const setLoading = useAppStore((s) => s.setFileTreeLoading);
  const setError = useAppStore((s) => s.setFileTreeError);
  const openFileInTab = useAppStore((s) => s.openFileInTab);

  const loadFolder = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      setRootFolder(path);
      setFileTree([]);
      useAppStore.setState({ expandedPaths: {} });
      try {
        const tree = await scanFolder(path);
        setRootFolder(path);
        setFileTree(tree.nodes);
        useAppStore.getState().applyFolderExpansion(tree.nodes);
        const prefs = await addRecentFolder(path);
        syncRecentFoldersFromPreferences(prefs);
        await persistPreferences();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [setRootFolder, setFileTree, setLoading, setError],
  );

  const openFolder = useCallback(async () => {
    const path = await pickFolder();
    if (path) await loadFolder(path);
  }, [loadFolder]);

  const openFile = useCallback(
    async (path: string) => {
      const existing = useAppStore.getState().findTabByPath(path);
      if (existing) {
        useAppStore.getState().setActiveTab(existing.id);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const file = await readFile(path);
        openFileInTab({
          path: file.path,
          title: basename(file.path),
          content: file.content,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [openFileInTab, setLoading, setError],
  );

  const openMarkdownFile = useCallback(async () => {
    const rootFolder = useAppStore.getState().rootFolder;
    const path = await pickOpenMarkdown(rootFolder);
    if (!path) return;

    await openFile(path);

    const parent = dirname(path);
    if (!rootFolder || !isUnderRoot(path, rootFolder)) {
      try {
        await loadFolder(parent);
      } catch {
        // File opened; sidebar tree optional if parent has no markdown files
      }
    }
  }, [loadFolder, openFile]);

  const refreshTree = useCallback(async () => {
    const root = useAppStore.getState().rootFolder;
    if (root) await loadFolder(root);
  }, [loadFolder]);

  const restoreLastFolder = useCallback(async () => {
    try {
      const { restoreLastFolderOnStartup } = useAppStore.getState();
      if (!restoreLastFolderOnStartup) return;

      const prefs = await getPreferences();
      if (prefs.lastOpenFolder) {
        await loadFolder(prefs.lastOpenFolder);
      }
    } catch {
      // preferences not available yet
    }
  }, [loadFolder]);

  const handleExternalMarkdownPaths = useCallback(
    async (paths: string[]) => {
      for (const path of paths) {
        if (!isMarkdownPath(path)) continue;

        await openFile(path);

        const rootFolder = useAppStore.getState().rootFolder;
        const parent = dirname(path);
        if (!rootFolder || !isUnderRoot(path, rootFolder)) {
          try {
            await loadFolder(parent);
          } catch {
            // File opened; sidebar tree optional if parent has no markdown files
          }
        }
      }
    },
    [loadFolder, openFile],
  );

  return {
    openFolder,
    openMarkdownFile,
    loadFolder,
    refreshTree,
    openFile,
    restoreLastFolder,
    handleExternalMarkdownPaths,
  };
}
