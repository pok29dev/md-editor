import { isTauri } from "@tauri-apps/api/core";
import { LogicalPosition } from "@tauri-apps/api/dpi";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const WORKSPACE_PARAM = "workspace";
const NEW_WORKSPACE_VALUE = "new";

export function shouldSkipStartupWorkspaceRestore(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get(WORKSPACE_PARAM) === NEW_WORKSPACE_VALUE;
}

function buildNewWorkspaceUrl(): string {
  const url = new URL(window.location.href);
  url.search = `?${WORKSPACE_PARAM}=${NEW_WORKSPACE_VALUE}`;
  url.hash = "";
  return `${url.pathname}${url.search}`;
}

export async function createNewWorkspaceWindow(): Promise<void> {
  if (!isTauri()) return;

  const label = `workspace-${Date.now()}`;
  const webview = new WebviewWindow(label, {
    url: buildNewWorkspaceUrl(),
    title: "MD Editor",
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    decorations: true,
    titleBarStyle: "overlay",
    hiddenTitle: true,
    acceptFirstMouse: true,
    trafficLightPosition: new LogicalPosition(16, 22),
  });

  await new Promise<void>((resolve, reject) => {
    webview.once("tauri://created", () => resolve());
    webview.once("tauri://error", (event) => {
      reject(new Error(String(event.payload)));
    });
  });
}
