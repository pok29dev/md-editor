import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { isTauri } from "@tauri-apps/api/core";

export function useOpenExternalFileEvents(
  handlePaths: (paths: string[]) => Promise<void>,
) {
  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | undefined;

    void listen<string[]>("open-file", (event) => {
      void handlePaths(event.payload);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      unlisten?.();
    };
  }, [handlePaths]);
}
