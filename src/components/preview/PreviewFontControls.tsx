import { Minus, Plus, RotateCcw } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import {
  PREVIEW_FONT_SIZE_DEFAULT,
  PREVIEW_FONT_SIZE_MAX,
  PREVIEW_FONT_SIZE_MIN,
  PREVIEW_FONT_SIZE_STEP,
  previewFontScalePercent,
} from "../../lib/preview/settings";
import "../../styles/preview-toolbar.css";

export function PreviewFontControls() {
  const previewFontSize = useAppStore((s) => s.previewFontSize);
  const setPreviewFontSize = useAppStore((s) => s.setPreviewFontSize);
  const resetPreviewFontSize = useAppStore((s) => s.resetPreviewFontSize);

  const scale = previewFontScalePercent(previewFontSize);

  return (
    <div
      className="preview-toolbar"
      role="toolbar"
      aria-label="Preview font size"
    >
      <div className="preview-toolbar-group" role="group" aria-label="Font size">
        <button
          type="button"
          className="preview-toolbar-btn preview-toolbar-btn--icon"
          title="Decrease preview font size"
          aria-label="Decrease preview font size"
          disabled={previewFontSize <= PREVIEW_FONT_SIZE_MIN}
          onClick={() =>
            setPreviewFontSize(previewFontSize - PREVIEW_FONT_SIZE_STEP)
          }
        >
          <Minus className="preview-toolbar-icon" aria-hidden />
        </button>
        <span
          className="preview-toolbar-scale"
          aria-live="polite"
          aria-label={`Preview font size ${previewFontSize} pixels, ${scale} percent`}
        >
          {scale}
        </span>
        <button
          type="button"
          className="preview-toolbar-btn preview-toolbar-btn--icon"
          title="Increase preview font size"
          aria-label="Increase preview font size"
          disabled={previewFontSize >= PREVIEW_FONT_SIZE_MAX}
          onClick={() =>
            setPreviewFontSize(previewFontSize + PREVIEW_FONT_SIZE_STEP)
          }
        >
          <Plus className="preview-toolbar-icon" aria-hidden />
        </button>
        <button
          type="button"
          className="preview-toolbar-btn preview-toolbar-btn--icon"
          title={`Reset preview font size (${PREVIEW_FONT_SIZE_DEFAULT}px)`}
          aria-label={`Reset preview font size to ${PREVIEW_FONT_SIZE_DEFAULT} pixels`}
          disabled={previewFontSize === PREVIEW_FONT_SIZE_DEFAULT}
          onClick={resetPreviewFontSize}
        >
          <RotateCcw className="preview-toolbar-icon" aria-hidden />
        </button>
      </div>
    </div>
  );
}
