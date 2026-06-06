import { useAppStore, type Theme, type ViewMode } from "../../stores/appStore";
import {
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_STEP,
} from "../../lib/layout/sidebarWidth";
import { resetGeneralSettings } from "../../lib/tauri/preferences";
import { SettingsResetButton } from "./SettingsResetButton";

const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "split", label: "Split" },
  { value: "editor", label: "Editor" },
  { value: "preview", label: "Preview" },
];

export function SettingsGeneral() {
  const theme = useAppStore((s) => s.theme);
  const syncScroll = useAppStore((s) => s.syncScroll);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const sidebarWidth = useAppStore((s) => s.sidebarWidth);
  const defaultViewMode = useAppStore((s) => s.defaultViewMode);
  const setTheme = useAppStore((s) => s.setTheme);
  const setSyncScroll = useAppStore((s) => s.setSyncScroll);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const setSidebarWidth = useAppStore((s) => s.setSidebarWidth);
  const setDefaultViewMode = useAppStore((s) => s.setDefaultViewMode);

  return (
    <section className="settings-section">
      <h3 className="settings-section-title">General</h3>
      <p className="settings-section-desc">
        Appearance and workspace defaults. Changes apply immediately and are saved
        automatically.
      </p>

      <fieldset className="settings-field">
        <legend className="settings-label">Theme</legend>
        <div className="settings-radio-group" role="radiogroup" aria-label="Theme">
          {THEMES.map(({ value, label }) => (
            <label key={value} className="settings-radio">
              <input
                type="radio"
                name="settings-theme"
                value={value}
                checked={theme === value}
                onChange={() => setTheme(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="settings-field settings-toggle">
        <span className="settings-label">Sync scroll</span>
        <input
          type="checkbox"
          checked={syncScroll}
          onChange={(e) => setSyncScroll(e.target.checked)}
        />
        <span className="settings-hint">Keep editor and preview scroll in sync</span>
      </label>

      <label className="settings-field settings-toggle">
        <span className="settings-label">Collapse sidebar</span>
        <input
          type="checkbox"
          checked={sidebarCollapsed}
          onChange={(e) => setSidebarCollapsed(e.target.checked)}
        />
        <span className="settings-hint">Hide file tree sidebar by default</span>
      </label>

      <div className="settings-field">
        <label className="settings-label" htmlFor="settings-sidebar-width">
          Sidebar width
          <span className="settings-value">{sidebarWidth}px</span>
        </label>
        <input
          id="settings-sidebar-width"
          className="settings-range"
          type="range"
          min={SIDEBAR_WIDTH_MIN}
          max={SIDEBAR_WIDTH_MAX}
          step={SIDEBAR_WIDTH_STEP}
          value={sidebarWidth}
          onChange={(e) => setSidebarWidth(Number(e.target.value))}
        />
        <span className="settings-hint">
          File tree width ({SIDEBAR_WIDTH_MIN}–{SIDEBAR_WIDTH_MAX}px)
        </span>
      </div>

      <label className="settings-field">
        <span className="settings-label">Default view mode</span>
        <select
          className="settings-select"
          value={defaultViewMode}
          onChange={(e) => setDefaultViewMode(e.target.value as ViewMode)}
        >
          {VIEW_MODES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="settings-hint">
          Default layout on startup and for newly opened tabs
        </span>
      </label>

      <SettingsResetButton onReset={resetGeneralSettings} />

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
          padding: 0;
          border: none;
        }
        .settings-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .settings-value {
          margin-left: 8px;
          font-weight: 500;
          color: var(--accent);
        }
        .settings-hint {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .settings-radio-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .settings-radio {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
          background: var(--bg-secondary);
        }
        .settings-radio:has(input:checked) {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 12%, var(--bg-secondary));
        }
        .settings-radio input {
          margin: 0;
        }
        .settings-toggle {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 10px;
        }
        .settings-toggle .settings-label {
          flex: 1 1 140px;
        }
        .settings-toggle .settings-hint {
          flex: 1 1 100%;
          margin-left: 0;
        }
        .settings-select {
          max-width: 220px;
          padding: 7px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
        }
        .settings-range {
          width: 100%;
          max-width: 320px;
          accent-color: var(--accent);
        }
      `}</style>
    </section>
  );
}
