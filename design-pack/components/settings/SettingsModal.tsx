import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { SettingsExport } from "./SettingsExport";
import { SettingsEditor } from "./SettingsEditor";
import { SettingsFiles } from "./SettingsFiles";
import { SettingsGeneral } from "./SettingsGeneral";

type SettingsTab = "general" | "editor" | "files" | "export";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "editor", label: "Editor" },
  { id: "files", label: "Files" },
  { id: "export", label: "Export" },
];

function SettingsPanel({ tab }: { tab: SettingsTab }) {
  switch (tab) {
    case "general":
      return <SettingsGeneral />;
    case "editor":
      return <SettingsEditor />;
    case "files":
      return <SettingsFiles />;
    case "export":
      return <SettingsExport />;
  }
}

export function SettingsModal() {
  const open = useAppStore((s) => s.settingsOpen);
  const setOpen = useAppStore((s) => s.setSettingsOpen);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(modalRef, open);

  useEffect(() => {
    if (!open) return;

    setActiveTab("general");
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="settings-overlay"
      onClick={() => setOpen(false)}
    >
      <div
        ref={modalRef}
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2 id="settings-title" className="settings-title">
            Settings
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="settings-close"
            aria-label="Close settings"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="settings-body">
          <nav className="settings-nav" aria-label="Settings sections">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`settings-nav-btn ${activeTab === id ? "active" : ""}`}
                aria-current={activeTab === id ? "page" : undefined}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="settings-content">
            <SettingsPanel tab={activeTab} />
          </div>
        </div>
      </div>

      <style>{`
        .settings-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 1100;
        }
        .settings-modal {
          width: min(720px, 100%);
          max-height: min(560px, calc(100vh - 48px));
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-modal);
          overflow: hidden;
        }
        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .settings-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .settings-close {
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          padding: 0 4px;
        }
        .settings-close:hover {
          color: var(--text-primary);
        }
        .settings-body {
          display: flex;
          min-height: 320px;
          overflow: hidden;
        }
        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 160px;
          flex-shrink: 0;
          padding: 12px;
          border-right: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }
        .settings-nav-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          text-align: left;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        .settings-nav-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .settings-nav-btn.active {
          background: var(--accent-subtle);
          color: var(--accent);
          font-weight: 600;
        }
        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .settings-section-title {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
