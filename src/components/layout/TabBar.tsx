import { useEffect, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { useTabActions } from "../../hooks/useTabActions";
import { PanelLeftOpenIcon } from "../icons/PanelIcons";

type TabContextMenu = {
  x: number;
  y: number;
  tabId: string;
};

export function TabBar() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const addTab = useAppStore((s) => s.addTab);
  const { tryCloseTab, tryCloseAllTabs, tryCloseOtherTabs } = useTabActions();
  const [contextMenu, setContextMenu] = useState<TabContextMenu | null>(null);

  useEffect(() => {
    if (!contextMenu) return;

    const close = () => setContextMenu(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [contextMenu]);

  const openContextMenu = (event: React.MouseEvent, tabId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveTab(tabId);
    setContextMenu({ x: event.clientX, y: event.clientY, tabId });
  };

  return (
    <div className="tab-bar" role="tablist">
      {sidebarCollapsed && (
        <button
          type="button"
          className="tab-bar-sidebar-toggle"
          title="Show sidebar (⌘\)"
          aria-label="Show sidebar"
          onClick={toggleSidebar}
        >
          <PanelLeftOpenIcon />
        </button>
      )}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${tab.id === activeTabId ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
          onContextMenu={(event) => openContextMenu(event, tab.id)}
          role="tab"
          aria-selected={tab.id === activeTabId}
        >
          <span className="tab-title">
            {tab.isDirty && <span className="tab-dirty" aria-label="Unsaved">•</span>}
            {tab.title}
          </span>
          {tabs.length > 1 && (
            <button
              className="tab-close"
              title="Close tab"
              aria-label={`Close ${tab.title}`}
              onClick={(e) => {
                e.stopPropagation();
                tryCloseTab(tab.id);
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button className="tab-add" title="New tab" aria-label="New tab" onClick={() => addTab()}>
        +
      </button>

      {contextMenu && (
        <div
          className="tab-context-menu"
          role="menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="tab-context-menu-item"
            role="menuitem"
            disabled={tabs.length <= 1}
            onClick={() => {
              const { tabId } = contextMenu;
              setContextMenu(null);
              void tryCloseOtherTabs(tabId);
            }}
          >
            Close Other Tabs
          </button>
          <button
            type="button"
            className="tab-context-menu-item"
            role="menuitem"
            onClick={() => {
              setContextMenu(null);
              void tryCloseAllTabs();
            }}
          >
            Close All Tabs
          </button>
        </div>
      )}

      <style>{`
        .tab-bar {
          display: flex;
          align-items: stretch;
          flex: 1;
          width: 100%;
          min-width: 0;
          min-height: 36px;
          background: var(--bg-tertiary);
          overflow-x: auto;
        }
        .tab-bar-sidebar-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          flex-shrink: 0;
          border: none;
          border-right: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }
        .tab-bar-sidebar-toggle:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .tab {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 12px;
          font-size: 12px;
          background: var(--tab-inactive);
          border-right: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          cursor: pointer;
          max-width: 200px;
          min-width: 80px;
          position: relative;
        }
        .tab.active {
          background: var(--tab-active);
          color: var(--text-primary);
        }
        .tab.active::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent);
        }
        .tab:hover:not(.active) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .tab-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tab-dirty {
          color: var(--status-modified);
          margin-right: 2px;
        }
        .tab-close {
          padding: 0 4px;
          font-size: 14px;
          line-height: 1;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          opacity: 0;
        }
        .tab:hover .tab-close,
        .tab.active .tab-close {
          opacity: 1;
        }
        .tab-close:hover {
          background: var(--bg-active);
          color: var(--text-primary);
        }
        .tab-add {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          padding: 0 12px;
          font-size: 16px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
        }
        .tab-add:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .tab-context-menu {
          position: fixed;
          min-width: 160px;
          padding: 4px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-modal);
          z-index: 200;
        }
        .tab-context-menu-item {
          display: block;
          width: 100%;
          padding: 7px 10px;
          border: none;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 500;
          text-align: left;
          white-space: nowrap;
        }
        .tab-context-menu-item:hover:not(:disabled) {
          background: var(--bg-hover);
        }
        .tab-context-menu-item:disabled {
          color: var(--text-muted);
          cursor: default;
        }
      `}</style>
    </div>
  );
}
