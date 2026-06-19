import { useAppStore, type FolderTreeExpansion } from "../../stores/appStore";
import { clearRecentFolders, resetFilesSettings } from "../../lib/tauri/preferences";
import { SettingsResetButton } from "./SettingsResetButton";

const FOLDER_EXPANSION_OPTIONS: {
  value: FolderTreeExpansion;
  label: string;
}[] = [
  { value: "one_level", label: "One level" },
  { value: "all", label: "All folders" },
];

function folderLabel(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export function SettingsFiles() {
  const rootFolder = useAppStore((s) => s.rootFolder);
  const recentFolders = useAppStore((s) => s.recentFolders);
  const restoreLastFolderOnStartup = useAppStore(
    (s) => s.restoreLastFolderOnStartup,
  );
  const setRestoreLastFolderOnStartup = useAppStore(
    (s) => s.setRestoreLastFolderOnStartup,
  );
  const folderTreeExpansion = useAppStore((s) => s.folderTreeExpansion);
  const setFolderTreeExpansion = useAppStore((s) => s.setFolderTreeExpansion);

  return (
    <section className="settings-section">
      <h3 className="settings-section-title">Files</h3>
      <p className="settings-section-desc">
        Control workspace restore on startup and manage recently opened folders.
      </p>

      <label className="settings-field settings-toggle">
        <span className="settings-label">Restore last folder on startup</span>
        <input
          type="checkbox"
          checked={restoreLastFolderOnStartup}
          onChange={(e) => setRestoreLastFolderOnStartup(e.target.checked)}
        />
        <span className="settings-hint">
          Automatically reopen the last workspace when the app launches
        </span>
      </label>

      <label className="settings-field">
        <span className="settings-label">Folder tree expansion</span>
        <select
          className="settings-select"
          value={folderTreeExpansion}
          onChange={(e) =>
            setFolderTreeExpansion(e.target.value as FolderTreeExpansion)
          }
        >
          {FOLDER_EXPANSION_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="settings-hint">
          When opening a folder, expand only top-level folders or expand the
          entire tree
        </span>
      </label>

      <div className="settings-field">
        <span className="settings-label">Current folder</span>
        <p className="settings-path">
          {rootFolder ?? "No folder open"}
        </p>
      </div>

      <div className="settings-field">
        <div className="settings-list-header">
          <span className="settings-label">Recent folders</span>
          <button
            type="button"
            className="settings-text-btn"
            disabled={recentFolders.length === 0}
            onClick={() => void clearRecentFolders()}
          >
            Clear
          </button>
        </div>
        {recentFolders.length === 0 ? (
          <p className="settings-hint">No recent folders yet.</p>
        ) : (
          <ul className="settings-recent-list">
            {recentFolders.map((path) => (
              <li key={path} className="settings-recent-item" title={path}>
                <span className="settings-recent-name">{folderLabel(path)}</span>
                <span className="settings-recent-path">{path}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SettingsResetButton
        onReset={resetFilesSettings}
        label="Reset file options to default"
      />

      <style>{`
        .settings-section-desc {
          margin: 0 0 20px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-muted);
        }
        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin: 0 0 18px;
        }
        .settings-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .settings-hint {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .settings-toggle {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 10px;
        }
        .settings-toggle .settings-label {
          flex: 1 1 180px;
        }
        .settings-toggle .settings-hint {
          flex: 1 1 100%;
        }
        .settings-select {
          width: 100%;
          max-width: 280px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
        }
        .settings-path {
          margin: 0;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-secondary);
          font-size: 12px;
          color: var(--text-secondary);
          word-break: break-all;
        }
        .settings-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .settings-text-btn {
          border: none;
          background: transparent;
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
        .settings-text-btn:disabled {
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .settings-recent-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }
        .settings-recent-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 8px 10px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .settings-recent-item:last-child {
          border-bottom: none;
        }
        .settings-recent-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .settings-recent-path {
          font-size: 11px;
          color: var(--text-muted);
          word-break: break-all;
        }
      `}</style>
    </section>
  );
}
