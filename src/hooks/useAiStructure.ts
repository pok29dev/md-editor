import { useCallback } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "../stores/appStore";
import { useEditorStore } from "../stores/editorStore";
import { getTabEditorView } from "../lib/editor/tabEditorCache";
import { normalizeMarkdown } from "../lib/markdown/normalize/normalizeMarkdown";
import { isAiStructureReady } from "../lib/aiStructure/settings";
import { runThclawsStructure } from "../lib/tauri/commands";
import { supportsPreview } from "../lib/files/fileKind";

function resolveEditorView() {
  const { view } = useEditorStore.getState();
  if (view) return view;
  const activeTabId = useAppStore.getState().activeTabId;
  if (!activeTabId) return null;
  return getTabEditorView(activeTabId) ?? null;
}

async function executeAiStructure(): Promise<boolean> {
  const aiStructure = useAppStore.getState().aiStructure;
  const activeTabId = useAppStore.getState().activeTabId;
  const activeTab = useAppStore
    .getState()
    .tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab || !supportsPreview(activeTab.fileKind)) {
    return false;
  }

  if (!isAiStructureReady(aiStructure)) {
    await message(
      aiStructure.useThclawsDefaults
        ? "Complete AI Structure setup: install thClaws, ensure it works on this machine, then run Test connection in Settings."
        : "Enter a model name in Settings (sent as --model to thClaws), then run Test connection.",
      { title: "AI Structure Setup Required", kind: "warning" },
    );
    useAppStore.getState().setSettingsOpen(true, "ai");
    return false;
  }

  const view = resolveEditorView();
  if (!view) {
    await message("Open a markdown document in the editor first.", {
      title: "AI Structure",
      kind: "warning",
    });
    return false;
  }

  const { from, to } = view.state.selection.main;
  const hasSelection = from !== to;
  const source = hasSelection
    ? view.state.sliceDoc(from, to)
    : view.state.doc.toString();
  const rangeFrom = hasSelection ? from : 0;
  const rangeTo = hasSelection ? to : view.state.doc.length;

  if (!source.trim()) {
    await message("Nothing to structure.", {
      title: "AI Structure",
      kind: "warning",
    });
    return false;
  }

  const prepared = aiStructure.runRulePassFirst
    ? normalizeMarkdown(source)
    : source;

  useAppStore.getState().setAiStructureRunning(true);
  try {
    const rootFolder = useAppStore.getState().rootFolder;
    if (!rootFolder) {
      await message("Open a folder before running AI Structure.", {
        title: "AI Structure",
        kind: "warning",
      });
      return false;
    }

    const result = await runThclawsStructure(
      rootFolder,
      prepared,
      aiStructure.thclawsPath || undefined,
      aiStructure.useThclawsDefaults,
      aiStructure.model,
    );

    if (result.markdown.trim() === source.trim()) {
      await message("AI Structure made no changes.", {
        title: "AI Structure",
        kind: "info",
      });
      return true;
    }

    useEditorStore.getState().setAiStructureDiff(true, {
      before: source,
      after: result.markdown,
      from: rangeFrom,
      to: rangeTo,
    });
    return true;
  } catch (err) {
    await message(String(err), {
      title: "AI Structure Failed",
      kind: "error",
    });
    return false;
  } finally {
    useAppStore.getState().setAiStructureRunning(false);
  }
}

export function useAiStructure() {
  const runAiStructure = useCallback(() => executeAiStructure(), []);
  return { runAiStructure };
}

export function runAiStructureFromMenu(): Promise<boolean> {
  return executeAiStructure();
}
