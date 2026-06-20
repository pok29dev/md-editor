import { useAppStore } from "../../stores/appStore";
import { useThclawsServe } from "../../hooks/useThclawsServe";

export function ThclawsPane() {
  const rootFolder = useAppStore((s) => s.rootFolder);
  const { uiState, serveUrl, errorMessage, run, stop } = useThclawsServe();

  const statusLabel =
    uiState === "running"
      ? "Running"
      : uiState === "starting"
        ? "Starting…"
        : uiState === "error"
          ? "Error"
          : "Stopped";

  return (
    <div className="thclaws-pane">
      <div className="thclaws-toolbar">
        <div className="thclaws-toolbar-actions">
          <button
            type="button"
            className="thclaws-btn thclaws-btn--primary"
            disabled={uiState === "starting" || uiState === "running"}
            title={
              !rootFolder
                ? "Open a folder in the sidebar first"
                : "Start thClaws web UI for this folder"
            }
            onClick={() => void run()}
          >
            Run
          </button>
          <button
            type="button"
            className="thclaws-btn"
            disabled={uiState !== "running" && uiState !== "starting"}
            onClick={() => void stop()}
          >
            Stop
          </button>
        </div>
        <div className="thclaws-toolbar-meta">
          <span className={`thclaws-status thclaws-status--${uiState}`}>
            {statusLabel}
          </span>
          {rootFolder ? (
            <span className="thclaws-workspace" title={rootFolder}>
              {rootFolder}
            </span>
          ) : (
            <span className="thclaws-workspace thclaws-workspace--missing">
              No folder open
            </span>
          )}
        </div>
      </div>

      <div className="thclaws-body">
        {uiState === "running" && serveUrl ? (
          <>
            <iframe
              className="thclaws-frame"
              src={serveUrl}
              title="thClaws"
              allow="clipboard-read; clipboard-write"
            />
            <p className="thclaws-frame-url">
              <a href={serveUrl} target="_blank" rel="noreferrer">
                Open in browser
              </a>
              {" · "}
              {serveUrl}
            </p>
          </>
        ) : (
          <div className="thclaws-placeholder">
            {uiState === "starting" ? (
              <p>Starting thClaws on this folder…</p>
            ) : uiState === "error" ? (
              <>
                <p>Could not start thClaws.</p>
                {errorMessage ? (
                  <p className="thclaws-error">{errorMessage}</p>
                ) : null}
              </>
            ) : (
              <>
                <p className="thclaws-placeholder-title">thClaws chat</p>
                <p className="thclaws-placeholder-hint">
                  Open a folder, then click <strong>Run</strong> to launch thClaws
                  for that workspace. Project config lives in{" "}
                  <code>.thclaws/</code> inside the open folder.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .thclaws-pane {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;
          width: 100%;
          background: var(--bg-primary);
        }
        .thclaws-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px 16px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }
        .thclaws-toolbar-actions {
          display: flex;
          gap: 8px;
        }
        .thclaws-btn {
          border: 1px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          font-size: 13px;
          cursor: pointer;
        }
        .thclaws-btn:hover:not(:disabled) {
          background: var(--bg-hover);
        }
        .thclaws-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .thclaws-btn--primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .thclaws-toolbar-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .thclaws-status--running {
          color: var(--accent);
        }
        .thclaws-status--error {
          color: var(--status-modified);
        }
        .thclaws-workspace {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: min(480px, 50vw);
        }
        .thclaws-workspace--missing {
          color: var(--text-muted);
        }
        .thclaws-body {
          flex: 1 1 auto;
          min-height: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .thclaws-frame {
          flex: 1;
          width: 100%;
          min-height: 0;
          border: 0;
          display: block;
          background: var(--bg-primary);
        }
        .thclaws-frame-url {
          flex-shrink: 0;
          margin: 0;
          padding: 4px 10px;
          font-size: 11px;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }
        .thclaws-frame-url a {
          color: var(--accent);
        }
        .thclaws-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          padding: 24px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }
        .thclaws-placeholder-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .thclaws-placeholder-hint {
          max-width: 420px;
          margin: 0;
          line-height: 1.5;
        }
        .thclaws-error {
          max-width: 520px;
          color: var(--status-modified);
          font-size: 12px;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
