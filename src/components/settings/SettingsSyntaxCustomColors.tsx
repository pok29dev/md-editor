import { useState } from "react";
import { useAppStore } from "../../stores/appStore";
import {
  SYNTAX_COLOR_TOKEN_FIELDS,
  syntaxColorPreviewTokens,
} from "../../lib/editor/syntaxColors";

type PaletteMode = "light" | "dark";

export function SettingsSyntaxCustomColors() {
  const editorSyntaxColors = useAppStore((s) => s.editorSyntaxColors);
  const editorSyntaxCustomColors = useAppStore((s) => s.editorSyntaxCustomColors);
  const setEditorSyntaxCustomColor = useAppStore(
    (s) => s.setEditorSyntaxCustomColor,
  );
  const resetEditorSyntaxCustomColors = useAppStore(
    (s) => s.resetEditorSyntaxCustomColors,
  );

  const [paletteMode, setPaletteMode] = useState<PaletteMode>("light");

  if (editorSyntaxColors !== "custom") return null;

  const palette = editorSyntaxCustomColors[paletteMode];
  const previewTokens = syntaxColorPreviewTokens(
    "custom",
    paletteMode === "dark",
    editorSyntaxCustomColors,
  );

  return (
    <div className="syntax-custom-panel">
      <div className="syntax-custom-header">
        <span className="syntax-custom-title">Custom colors</span>
        <div className="syntax-mode-toggle" role="group" aria-label="Palette mode">
          <button
            type="button"
            className={`syntax-mode-btn ${paletteMode === "light" ? "active" : ""}`}
            aria-pressed={paletteMode === "light"}
            onClick={() => setPaletteMode("light")}
          >
            Light
          </button>
          <button
            type="button"
            className={`syntax-mode-btn ${paletteMode === "dark" ? "active" : ""}`}
            aria-pressed={paletteMode === "dark"}
            onClick={() => setPaletteMode("dark")}
          >
            Dark
          </button>
        </div>
      </div>

      <p className="settings-hint">
        Colors apply when the app is in {paletteMode} mode. Changes update open
        JSON/YAML tabs immediately.
      </p>

      <div className="syntax-color-grid">
        {SYNTAX_COLOR_TOKEN_FIELDS.map(({ key, label, hint }) => (
          <label key={key} className="syntax-color-field">
            <span className="syntax-color-field-label">{label}</span>
            <div className="syntax-color-inputs">
              <input
                type="color"
                className="syntax-color-picker"
                value={palette[key]}
                aria-label={`${label} color`}
                onChange={(e) =>
                  setEditorSyntaxCustomColor(paletteMode, key, e.target.value)
                }
              />
              <input
                type="text"
                className="syntax-color-hex"
                value={palette[key]}
                spellCheck={false}
                aria-label={`${label} hex value`}
                onChange={(e) =>
                  setEditorSyntaxCustomColor(paletteMode, key, e.target.value)
                }
              />
            </div>
            <span className="settings-hint">{hint}</span>
          </label>
        ))}
      </div>

      {previewTokens.length > 0 && (
        <div className="syntax-color-preview" aria-hidden>
          {previewTokens.map(({ label, color }) => (
            <span key={label} className="syntax-color-chip">
              <span
                className="syntax-color-swatch"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        className="syntax-custom-reset"
        onClick={() => resetEditorSyntaxCustomColors()}
      >
        Reset custom colors to GitHub defaults
      </button>

      <style>{`
        .syntax-custom-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
          padding: 12px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
        }
        .syntax-custom-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .syntax-custom-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .syntax-mode-toggle {
          display: inline-flex;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }
        .syntax-mode-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          padding: 5px 10px;
          cursor: pointer;
        }
        .syntax-mode-btn.active {
          background: var(--accent-subtle);
          color: var(--accent);
          font-weight: 600;
        }
        .syntax-color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .syntax-color-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .syntax-color-field-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .syntax-color-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .syntax-color-picker {
          width: 36px;
          height: 28px;
          padding: 0;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
        }
        .syntax-color-hex {
          flex: 1;
          min-width: 0;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 12px;
          font-family: "SF Mono", Menlo, Consolas, monospace;
        }
        .syntax-custom-reset {
          align-self: flex-start;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-secondary);
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .syntax-custom-reset:hover {
          color: var(--text-primary);
          border-color: var(--accent);
        }
        .syntax-color-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
        }
        .syntax-color-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
          font-family: "SF Mono", Menlo, Consolas, monospace;
        }
        .syntax-color-swatch {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          border: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
