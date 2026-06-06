import { useMemo } from "react";
import { useAppStore } from "../../stores/appStore";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function formatCount(n: number): string {
  return n.toLocaleString();
}

export function StatusBar() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const content = activeTab?.content ?? "";

  const { words, characters } = useMemo(
    () => ({
      words: countWords(content),
      characters: content.length,
    }),
    [content],
  );

  return (
    <footer className="status-bar">
      <span className="status-item status-path">
        {activeTab?.path ?? activeTab?.title ?? "No file"}
      </span>
      <span className="status-spacer" />
      <span className="status-item">{formatCount(words)} words</span>
      <span className="status-item">{formatCount(characters)} characters</span>
      <span
        className={`status-item status-save ${activeTab?.isDirty ? "modified" : "saved"}`}
      >
        {activeTab?.isDirty ? "Modified" : "Saved"}
      </span>

      <style>{`
        .status-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 12px;
          height: 26px;
          font-size: 11px;
          background: var(--status-bg);
          color: var(--text-secondary);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .status-path {
          max-width: 40%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .status-item {
          white-space: nowrap;
        }
        .status-save.modified {
          color: var(--accent);
        }
        .status-save.saved {
          color: var(--text-muted);
        }
        .status-spacer {
          flex: 1;
        }
      `}</style>
    </footer>
  );
}
