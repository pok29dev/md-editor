import { useEffect, useRef } from "react";

export interface PdfExportOverlayProps {
  open: boolean;
  percent: number;
  step: string;
  onCancel: () => void;
}

export function PdfExportOverlay({
  open,
  percent,
  step,
  onCancel,
}: PdfExportOverlayProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="pdf-export-overlay" role="dialog" aria-modal="true" aria-labelledby="pdf-export-title">
      <div className="pdf-export-modal">
        <div className="pdf-export-header">
          <p id="pdf-export-title" className="pdf-export-title">
            Generating PDF
          </p>
          <button
            ref={cancelRef}
            type="button"
            className="pdf-export-close"
            aria-label="Cancel PDF generation"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <div className="pdf-export-percent">{Math.round(percent)}%</div>
        <div
          className="pdf-export-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <div className="pdf-export-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="pdf-export-step">{step}</p>
        <button type="button" className="pdf-export-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <style>{overlayStyles}</style>
    </div>
  );
}

const overlayStyles = `
  .pdf-export-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
  }
  .pdf-export-modal {
    width: min(420px, calc(100vw - 32px));
    padding: 20px;
    border-radius: 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  }
  .pdf-export-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .pdf-export-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .pdf-export-close {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    padding: 0 4px;
  }
  .pdf-export-close:hover {
    color: var(--text-primary);
  }
  .pdf-export-percent {
    font-size: 28px;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 10px;
  }
  .pdf-export-track {
    height: 8px;
    border-radius: 999px;
    background: var(--bg-secondary);
    overflow: hidden;
    margin-bottom: 12px;
  }
  .pdf-export-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.2s ease;
  }
  .pdf-export-step {
    margin: 0 0 16px;
    font-size: 13px;
    color: var(--text-secondary);
  }
  .pdf-export-cancel {
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 13px;
    cursor: pointer;
  }
  .pdf-export-cancel:hover {
    background: var(--bg-hover);
  }
`;
