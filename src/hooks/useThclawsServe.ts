import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import { isTauri } from "@tauri-apps/api/core";
import { useAppStore } from "../stores/appStore";
import {
  getThclawsServeStatus,
  startThclawsServe,
  stopThclawsServe,
} from "../lib/tauri/commands";

export type ThclawsServeUiState = "stopped" | "starting" | "running" | "error";

export function useThclawsServe() {
  const rootFolder = useAppStore((s) => s.rootFolder);
  const thclawsPath = useAppStore((s) => s.aiStructure.thclawsPath);
  const [uiState, setUiState] = useState<ThclawsServeUiState>("stopped");
  const [serveUrl, setServeUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const boundFolderRef = useRef<string | null>(null);

  const resetUi = useCallback(() => {
    setUiState("stopped");
    setServeUrl(null);
    setErrorMessage(null);
    boundFolderRef.current = null;
  }, []);

  const syncStatus = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const status = await getThclawsServeStatus();
      if (status.running && status.url) {
        setUiState("running");
        setServeUrl(status.url);
        boundFolderRef.current = status.workingDir;
        setErrorMessage(null);
      } else {
        resetUi();
      }
    } catch {
      resetUi();
    }
  }, [resetUi]);

  const run = useCallback(async () => {
    if (!isTauri()) {
      window.alert("thClaws serve requires the desktop app (npm run tauri dev).");
      return;
    }

    const folder = useAppStore.getState().rootFolder;
    if (!folder) {
      await message("Open a folder in the sidebar before starting thClaws.", {
        title: "thClaws",
        kind: "warning",
      });
      return;
    }

    setUiState("starting");
    setErrorMessage(null);
    try {
      const result = await startThclawsServe(
        folder,
        thclawsPath || undefined,
      );
      boundFolderRef.current = result.workingDir;
      setServeUrl(result.url);
      setUiState("running");
    } catch (err) {
      const text = String(err);
      console.error("[thClaws serve]", text);
      setErrorMessage(text);
      setUiState("error");
      setServeUrl(null);
      await message(text, { title: "thClaws Failed to Start", kind: "error" });
    }
  }, [thclawsPath]);

  const stop = useCallback(async () => {
    if (!isTauri()) {
      resetUi();
      return;
    }
    try {
      await stopThclawsServe();
    } catch {
      // best-effort shutdown
    } finally {
      resetUi();
    }
  }, [resetUi]);

  useEffect(() => {
    if (!rootFolder) {
      if (uiState === "running" || uiState === "starting") {
        void stop();
      }
      return;
    }
    if (
      boundFolderRef.current &&
      boundFolderRef.current !== rootFolder &&
      uiState === "running"
    ) {
      void stop();
    }
  }, [rootFolder, stop, uiState]);

  useEffect(() => {
    if (!isTauri()) return;
    void syncStatus();
  }, [syncStatus]);

  return {
    uiState,
    serveUrl,
    errorMessage,
    run,
    stop,
    resetUi,
  };
}

export async function stopThclawsServeIfRunning(): Promise<void> {
  if (!isTauri()) return;
  try {
    const status = await getThclawsServeStatus();
    if (status.running) {
      await stopThclawsServe();
    }
  } catch {
    // ignore shutdown errors during folder changes
  }
}
