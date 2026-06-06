import { useAppStore } from "../../stores/appStore";
import { scanFolder } from "./commands";

export async function refreshTreeIfUnderRoot(savedPath: string): Promise<void> {
  const { rootFolder, setFileTree } = useAppStore.getState();
  if (!rootFolder) return;

  const normalizedRoot = rootFolder.replace(/\\/g, "/");
  const normalizedPath = savedPath.replace(/\\/g, "/");
  if (
    !normalizedPath.startsWith(normalizedRoot + "/") &&
    normalizedPath !== normalizedRoot
  ) {
    return;
  }

  try {
    const tree = await scanFolder(rootFolder);
    setFileTree(tree.nodes);
  } catch {
    // tree refresh is best-effort
  }
}
