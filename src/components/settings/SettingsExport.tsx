import { useAppStore, type ExportPdfPageSize, type ExportPdfTheme } from "../../stores/appStore";
import { resetExportSettings } from "../../lib/tauri/preferences";
import { SettingsResetButton } from "./SettingsResetButton";

const PDF_THEMES: { value: ExportPdfTheme; label: string }[] = [
  { value: "app", label: "Match app theme" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const PDF_PAGE_SIZES: { value: ExportPdfPageSize; label: string }[] = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "Letter" },
];

export function SettingsExport() {
  const exportPdfTheme = useAppStore((s) => s.exportPdfTheme);
  const exportPdfPageSize = useAppStore((s) => s.exportPdfPageSize);
  const setExportPdfTheme = useAppStore((s) => s.setExportPdfTheme);
  const setExportPdfPageSize = useAppStore((s) => s.setExportPdfPageSize);

  return (
    <section className="settings-section">
      <h3 className="settings-section-title">Export</h3>
      <p className="settings-section-desc">
        PDF export defaults. HTML export is unchanged.
      </p>

      <label className="settings-field">
        <span className="settings-label">PDF theme</span>
        <select
          className="settings-select"
          value={exportPdfTheme}
          onChange={(e) => setExportPdfTheme(e.target.value as ExportPdfTheme)}
        >
          {PDF_THEMES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="settings-hint">
          Color scheme for exported PDF preview and diagrams
        </span>
      </label>

      <label className="settings-field">
        <span className="settings-label">PDF page size</span>
        <select
          className="settings-select"
          value={exportPdfPageSize}
          onChange={(e) =>
            setExportPdfPageSize(e.target.value as ExportPdfPageSize)
          }
        >
          {PDF_PAGE_SIZES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="settings-hint">Paper size used when building the PDF</span>
      </label>

      <SettingsResetButton onReset={resetExportSettings} />

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
        .settings-select {
          max-width: 220px;
          padding: 7px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
        }
      `}</style>
    </section>
  );
}
