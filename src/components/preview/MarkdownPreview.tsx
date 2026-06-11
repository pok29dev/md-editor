import { useEffect, useRef } from "react";
import { usePreview } from "../../hooks/usePreview";
import { useEditorStore } from "../../stores/editorStore";
import { PreviewFontControls } from "./PreviewFontControls";

interface MarkdownPreviewProps {
  content: string;
  tabId: string | null;
}

export function MarkdownPreview({ content, tabId }: MarkdownPreviewProps) {
  const paneRef = useRef<HTMLDivElement>(null);
  const setPreviewScrollEl = useEditorStore((s) => s.setPreviewScrollEl);
  const { containerRef, isRefreshing } = usePreview(content, tabId, paneRef);

  useEffect(() => {
    setPreviewScrollEl(paneRef.current);
    return () => setPreviewScrollEl(null);
  }, [setPreviewScrollEl]);

  return (
    <div className="preview-pane-shell">
      <PreviewFontControls />
      <div
        ref={paneRef}
        className="preview-pane"
        aria-busy={isRefreshing}
        data-render-state={isRefreshing ? "refreshing" : "ready"}
      >
        <div ref={containerRef} className="preview-content" />
      </div>
    </div>
  );
}
