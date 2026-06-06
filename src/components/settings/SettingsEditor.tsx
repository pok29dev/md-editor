import { useAppStore } from "../../stores/appStore";
import {
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_MIN,
} from "../../lib/editor/settings";
import { resetEditorSettings } from "../../lib/tauri/preferences";
import { SettingsResetButton } from "./SettingsResetButton";

const TAB_SIZES = [
  { value: 2 as const, label: "2 spaces" },
  { value: 4 as const, label: "4 spaces" },
];

export function SettingsEditor() {
  const editorFontSize = useAppStore((s) => s.editorFontSize);
  const editorTabSize = useAppStore((s) => s.editorTabSize);
  const editorLineNumbers = useAppStore((s) => s.editorLineNumbers);
  const editorLineWrap = useAppStore((s) => s.editorLineWrap);
  const setEditorFontSize = useAppStore((s) => s.setEditorFontSize);
  const setEditorTabSize = useAppStore((s) => s.setEditorTabSize);
  const setEditorLineNumbers = useAppStore((s) => s.setEditorLineNumbers);
  const setEditorLineWrap = useAppStore((s) => s.setEditorLineWrap);

  return (
    <section className="settings-section">
      <h3 className="settings-section-title">Editor</h3>
      <p className="settings-section-desc">
        Code editing defaults. Changes apply immediately to all open tabs.
      </p>

      <div className="settings-field">
        <label className="settings-label" htmlFor="settings-editor-font-size">
          Font size
          <span className="settings-value">{editorFontSize}px</span>
        </label>
        <input
          id="settings-editor-font-size"
          className="settings-range"
          type="range"
          min={EDITOR_FONT_SIZE_MIN}
          max={EDITOR_FONT_SIZE_MAX}
          step={1}
          value={editorFontSize}
          onChange={(e) => setEditorFontSize(Number(e.target.value))}
        />
        <span className="settings-hint">
          Editor monospace size ({EDITOR_FONT_SIZE_MIN}–{EDITOR_FONT_SIZE_MAX}px)
        </span>
      </div>

      <label className="settings-field">
        <span className="settings-label">Tab size</span>
        <select
          className="settings-select"
          value={editorTabSize}
          onChange={(e) => setEditorTabSize(Number(e.target.value) as 2 | 4)}
        >
          {TAB_SIZES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="settings-hint">Indent width when pressing Tab</span>
      </label>

      <label className="settings-field settings-toggle">
        <span className="settings-label">Line numbers</span>
        <input
          type="checkbox"
          checked={editorLineNumbers}
          onChange={(e) => setEditorLineNumbers(e.target.checked)}
        />
        <span className="settings-hint">Show gutter line numbers</span>
      </label>

      <label className="settings-field settings-toggle">
        <span className="settings-label">Line wrap</span>
        <input
          type="checkbox"
          checked={editorLineWrap}
          onChange={(e) => setEditorLineWrap(e.target.checked)}
        />
        <span className="settings-hint">
          Wrap long lines instead of horizontal scrolling
        </span>
      </label>

      <SettingsResetButton onReset={resetEditorSettings} />

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
