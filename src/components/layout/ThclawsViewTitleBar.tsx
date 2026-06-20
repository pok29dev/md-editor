export function ThclawsViewTitleBar() {
  return (
    <div className="thclaws-view-titlebar" role="presentation">
      <span className="thclaws-view-titlebar-label">thClaws</span>
      <span className="thclaws-view-titlebar-hint">
        Click Run below to start the chat UI
      </span>
      <style>{`
        .thclaws-view-titlebar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          width: 100%;
          min-width: 0;
          min-height: 36px;
          padding: 0 12px;
          background: var(--bg-tertiary);
        }
        .thclaws-view-titlebar-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .thclaws-view-titlebar-hint {
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
