import { useCallback, useRef, useState } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "../stores/appStore";
import { buildStandaloneHtml } from "../lib/markdown/exportHtml";
import {
  buildPdfBytes,
  PdfExportCancelledError,
} from "../lib/markdown/exportPdf";
import { resolveExportPdfIsDark } from "../lib/markdown/exportSettings";
import {
  getActiveTabForSave,
  syncActiveTabContentFromEditor,
} from "../lib/editor/getEditorContent";
import { syncTabEditorContent } from "../lib/editor/tabEditorCache";
import { refreshTreeIfUnderRoot } from "../lib/tauri/refreshTree";
import {
  pickSaveHtml,
  pickSaveFile,
  pickSavePdf,
  writeBinaryFile,
  writeFile,
} from "../lib/tauri/commands";
import { defaultExtensionForKind, supportsPreview } from "../lib/files/fileKind";
import { confirmSaveDespiteInvalidSyntax } from "../lib/files/saveStructured";
import {
  formatStructuredContent,
} from "../lib/files/validateStructured";
import { applyNormalizeMarkdown } from "../lib/editor/normalizeActions";
import { normalizeMarkdown } from "../lib/markdown/normalize/normalizeMarkdown";
import { getTabEditorView } from "../lib/editor/tabEditorCache";
import { useEditorStore } from "../stores/editorStore";

function basename(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export function useFileActions() {
  const markTabSaved = useAppStore((s) => s.markTabSaved);
  const updateTabAfterSave = useAppStore((s) => s.updateTabAfterSave);

  const [pdfExportOpen, setPdfExportOpen] = useState(false);
  const [pdfExportPercent, setPdfExportPercent] = useState(0);
  const [pdfExportStep, setPdfExportStep] = useState("Preparing");
  const pdfAbortRef = useRef<AbortController | null>(null);

  const save = async (): Promise<boolean> => {
    const activeTab = syncActiveTabContentFromEditor();
    if (!activeTab) return false;

    const path = activeTab.path?.trim();
    if (!path) {
      return saveAs();
    }

    const tabId = activeTab.id;
    const content = activeTab.content;

    if (!(await confirmSaveDespiteInvalidSyntax(activeTab.fileKind, content))) {
      return false;
    }

    try {
      await writeFile(path, content);
      markTabSaved(tabId);
      return true;
    } catch (err) {
      await message(String(err), { title: "Save Failed", kind: "error" });
      return false;
    }
  };

  const saveAs = async (): Promise<boolean> => {
    const activeTab = syncActiveTabContentFromEditor();
    if (!activeTab) return false;

    const defaultName = activeTab.path
      ? basename(activeTab.path)
      : `${activeTab.title.replace(/\s+/g, "-").toLowerCase() || "untitled"}.${defaultExtensionForKind(activeTab.fileKind)}`;

    const path = await pickSaveFile(defaultName, activeTab.fileKind);
    if (!path) return false;

    if (!(await confirmSaveDespiteInvalidSyntax(activeTab.fileKind, activeTab.content))) {
      return false;
    }

    try {
      await writeFile(path, activeTab.content);
      updateTabAfterSave(activeTab.id, path);
      await refreshTreeIfUnderRoot(path);
      return true;
    } catch (err) {
      await message(String(err), { title: "Save Failed", kind: "error" });
      return false;
    }
  };

  const exportHtml = async (): Promise<boolean> => {
    const activeTab = getActiveTabForSave();
    if (!activeTab) return false;

    const defaultName = activeTab.path
      ? basename(activeTab.path).replace(/\.md$/i, ".html")
      : `${activeTab.title.replace(/\s+/g, "-").toLowerCase() || "document"}.html`;

    const path = await pickSaveHtml(defaultName);
    if (!path) return false;

    try {
      const html = buildStandaloneHtml(activeTab.content, activeTab.title);
      await writeFile(path, html);
      await message(`Exported to ${basename(path)}`, {
        title: "Export Complete",
        kind: "info",
      });
      return true;
    } catch (err) {
      await message(String(err), { title: "Export Failed", kind: "error" });
      return false;
    }
  };

  const cancelPdfExport = useCallback(() => {
    pdfAbortRef.current?.abort();
    pdfAbortRef.current = null;
    setPdfExportOpen(false);
  }, []);

  const exportPdf = async (): Promise<boolean> => {
    const activeTab = getActiveTabForSave();
    if (!activeTab) return false;

    const defaultName = activeTab.path
      ? basename(activeTab.path).replace(/\.md$/i, ".pdf")
      : `${activeTab.title.replace(/\s+/g, "-").toLowerCase() || "document"}.pdf`;

    const path = await pickSavePdf(defaultName);
    if (!path) return false;

    const controller = new AbortController();
    pdfAbortRef.current = controller;
    setPdfExportOpen(true);
    setPdfExportPercent(0);
    setPdfExportStep("Preparing");

    try {
      const { exportPdfTheme, exportPdfPageSize, resolvedColorScheme } =
        useAppStore.getState();
      const pdfBytes = await buildPdfBytes({
        markdown: activeTab.content,
        isDark: resolveExportPdfIsDark(exportPdfTheme, resolvedColorScheme),
        pageSize: exportPdfPageSize,
        signal: controller.signal,
        onProgress: ({ percent, step }) => {
          setPdfExportPercent(percent);
          setPdfExportStep(step);
        },
      });

      await writeBinaryFile(path, pdfBytes);
      setPdfExportOpen(false);
      await message(`Exported to ${basename(path)}`, {
        title: "Export Complete",
        kind: "info",
      });
      return true;
    } catch (err) {
      if (err instanceof PdfExportCancelledError || controller.signal.aborted) {
        return false;
      }
      await message(String(err), { title: "Export Failed", kind: "error" });
      return false;
    } finally {
      pdfAbortRef.current = null;
      setPdfExportOpen(false);
    }
  };

  const formatDocument = async (): Promise<boolean> => {
    const activeTab = syncActiveTabContentFromEditor();
    if (!activeTab) return false;

    if (activeTab.fileKind === "markdown") {
      try {
        const storeView = useEditorStore.getState().view;
        const view =
          storeView ?? getTabEditorView(activeTab.id) ?? null;

        if (view) {
          return applyNormalizeMarkdown(view);
        }

        const normalized = normalizeMarkdown(activeTab.content);
        useAppStore.getState().updateTabContent(activeTab.id, normalized);
        syncTabEditorContent(activeTab.id, normalized);
        return true;
      } catch (err) {
        await message(String(err), {
          title: "Normalize Failed",
          kind: "error",
        });
        return false;
      }
    }

    if (supportsPreview(activeTab.fileKind)) return false;

    try {
      const formatted = formatStructuredContent(
        activeTab.fileKind,
        activeTab.content,
      );
      useAppStore.getState().updateTabContent(activeTab.id, formatted);
      syncTabEditorContent(activeTab.id, formatted);
      return true;
    } catch (err) {
      await message(String(err), {
        title: "Format Failed",
        kind: "error",
      });
      return false;
    }
  };

  const activeTab = getActiveTabForSave();

  return {
    save,
    saveAs,
    formatDocument,
    exportHtml,
    exportPdf,
    cancelPdfExport,
    pdfExportOpen,
    pdfExportPercent,
    pdfExportStep,
    activeTab,
  };
}
