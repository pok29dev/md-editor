import { useAppStore, type AppTheme, type ColorScheme, type ViewMode } from "../../stores/appStore";
import {
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_STEP,
} from "../../lib/layout/sidebarWidth";
import { resetGeneralSettings } from "../../lib/tauri/preferences";
import { SettingsResetButton } from "./SettingsResetButton";

const COLOR_SCHEMES: {
  value: ColorScheme;
  label: string;
  description: string;
  preview: "system" | "light" | "dark";
}[] = [
  { value: "system", label: "System", description: "Match macOS", preview: "system" },
  { value: "light", label: "Light", description: "Always light", preview: "light" },
  { value: "dark", label: "Dark", description: "Always dark", preview: "dark" },
];

const APP_THEMES: {
  value: AppTheme;
  label: string;
  description: string;
  available: boolean;
}[] = [
  { value: "default", label: "Default", description: "Native macOS palette & icons", available: true },
  { value: "blue", label: "Blue", description: "Carbon-inspired, sharp & precise", available: true },
  { value: "warm", label: "Warm Editor", description: "Soft editorial tones", available: true },
];

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "split", label: "Split" },
  { value: "editor", label: "Editor" },
  { value: "preview", label: "Preview" },
];

function ColorSchemePreview({ variant }: { variant: "system" | "light" | "dark" }) {
  if (variant === "system") {
    return (
      <span className="color-scheme-preview color-scheme-preview--system" aria-hidden>
        <span className="color-scheme-preview-half color-scheme-preview-half--light" />
        <span className="color-scheme-preview-half color-scheme-preview-half--dark" />
      </span>
    );
  }
  return (
    <span
      className={`color-scheme-preview color-scheme-preview--${variant}`}
      aria-hidden
    />
  );
}

function AppThemePreview({ variant }: { variant: AppTheme }) {
  const swatches: Record<AppTheme, { accent: string; bg: string }> = {
    default: { accent: "#007aff", bg: "#f8f8fa" },
    blue: { accent: "#0f62fe", bg: "#f4f4f4" },
    warm: { accent: "#d97706", bg: "#faf6f0" },
  };
  const { accent, bg } = swatches[variant];
  return (
    <span className="app-theme-preview" style={{ background: bg }} aria-hidden>
      <span className="app-theme-preview-accent" style={{ background: accent }} />
    </span>
  );
}

export function SettingsGeneral() {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const theme = useAppStore((s) => s.theme);
  const syncScroll = useAppStore((s) => s.syncScroll);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const sidebarWidth = useAppStore((s) => s.sidebarWidth);
  const defaultViewMode = useAppStore((s) => s.defaultViewMode);
  const setColorScheme = useAppStore((s) => s.setColorScheme);
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
        <legend className="settings-label">Color scheme</legend>
        <p className="settings-field-desc">Light or dark appearance</p>
        <div className="settings-picker-grid" role="radiogroup" aria-label="Color scheme">
          {COLOR_SCHEMES.map(({ value, label, description, preview }) => (
            <label
              key={value}
              className={`settings-picker-card ${colorScheme === value ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="settings-color-scheme"
                value={value}
                checked={colorScheme === value}
                onChange={() => setColorScheme(value)}
              />
              <ColorSchemePreview variant={preview} />
              <span className="settings-picker-card-label">{label}</span>
              <span className="settings-picker-card-desc">{description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="settings-field">
        <legend className="settings-label">Theme</legend>
        <p className="settings-field-desc">Color system and icon style</p>
        <div className="settings-picker-grid" role="radiogroup" aria-label="Theme">
          {APP_THEMES.map(({ value, label, description, available }) => (
            <label
              key={value}
              className={`settings-picker-card ${theme === value ? "selected" : ""} ${!available ? "disabled" : ""}`}
            >
              <input
                type="radio"
                name="settings-theme"
                value={value}
                checked={theme === value}
                disabled={!available}
                onChange={() => setTheme(value)}
              />
              <AppThemePreview variant={value} />
              <span className="settings-picker-card-label">{label}</span>
              <span className="settings-picker-card-desc">
                {available ? description : "Coming soon"}
              </span>
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
        .settings-field-desc {
          margin: 0 0 4px;
          font-size: 12px;
          color: var(--text-muted);
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
        .settings-picker-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .settings-picker-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          cursor: pointer;
          text-align: center;
          transition: border-color 0.12s, background 0.12s;
        }
        .settings-picker-card:hover:not(.disabled) {
          background: var(--bg-hover);
        }
        .settings-picker-card.selected {
          border-color: var(--accent);
          background: var(--accent-subtle);
        }
        .settings-picker-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .settings-picker-card input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        .settings-picker-card-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .settings-picker-card-desc {
          font-size: 11px;
          color: var(--text-muted);
        }
        .color-scheme-preview {
          display: block;
          width: 48px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .color-scheme-preview--light {
          background: #f8f8fa;
        }
        .color-scheme-preview--dark {
          background: #1c1c1e;
        }
        .color-scheme-preview--system {
          display: flex;
        }
        .color-scheme-preview-half {
          flex: 1;
          height: 100%;
        }
        .color-scheme-preview-half--light {
          background: #f8f8fa;
        }
        .color-scheme-preview-half--dark {
          background: #1c1c1e;
        }
        .app-theme-preview {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 48px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--border);
          padding-bottom: 6px;
        }
        .app-theme-preview-accent {
          display: block;
          width: 24px;
          height: 4px;
          border-radius: 2px;
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
          border-radius: var(--radius-sm);
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
