import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { useEditorStore } from "../stores/editorStore";
import { useActiveViewMode } from "./useActiveViewMode";

function syncScrollPosition(
  source: HTMLElement,
  target: HTMLElement,
) {
  const sourceMax = source.scrollHeight - source.clientHeight;
  const targetMax = target.scrollHeight - target.clientHeight;
  const ratio = sourceMax > 0 ? source.scrollTop / sourceMax : 0;
  target.scrollTop = ratio * targetMax;
}

export function useSyncScroll() {
  const syncScroll = useAppStore((s) => s.syncScroll);
  const viewMode = useActiveViewMode();
  const view = useEditorStore((s) => s.view);
  const previewEl = useEditorStore((s) => s.previewScrollEl);

  useEffect(() => {
    if (!syncScroll || viewMode !== "split" || !view || !previewEl) return;

    const editorEl = view.scrollDOM;
    if (!editorEl.isConnected || !previewEl.isConnected) return;

    let syncing = false;
    let disposed = false;

    const onEditorScroll = () => {
      if (disposed || syncing) return;
      syncing = true;
      try {
        syncScrollPosition(editorEl, previewEl);
      } catch {
        // Editor/preview may be unmounting
      }
      requestAnimationFrame(() => {
        syncing = false;
      });
    };

    const onPreviewScroll = () => {
      if (disposed || syncing) return;
      syncing = true;
      try {
        syncScrollPosition(previewEl, editorEl);
      } catch {
        // Editor/preview may be unmounting
      }
      requestAnimationFrame(() => {
        syncing = false;
      });
    };

    editorEl.addEventListener("scroll", onEditorScroll, { passive: true });
    previewEl.addEventListener("scroll", onPreviewScroll, { passive: true });

    return () => {
      disposed = true;
      editorEl.removeEventListener("scroll", onEditorScroll);
      previewEl.removeEventListener("scroll", onPreviewScroll);
    };
  }, [syncScroll, viewMode, view, previewEl]);
}
