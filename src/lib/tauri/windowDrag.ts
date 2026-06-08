import type { MouseEvent as ReactMouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function handleWindowDrag(event: ReactMouseEvent) {
  if (event.button !== 0) return;
  if ((event.target as HTMLElement).closest("button, a, input, select, textarea")) {
    return;
  }
  void getCurrentWindow().startDragging();
}
