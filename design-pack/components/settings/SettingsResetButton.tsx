interface SettingsResetButtonProps {
  onReset: () => void;
  label?: string;
}

export function SettingsResetButton({
  onReset,
  label = "Reset to defaults",
}: SettingsResetButtonProps) {
  return (
    <div className="settings-reset-row">
      <button type="button" className="settings-reset-btn" onClick={onReset}>
        {label}
      </button>
      <style>{`
        .settings-reset-row {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .settings-reset-btn {
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          padding: 7px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .settings-reset-btn:hover {
          color: var(--text-primary);
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
