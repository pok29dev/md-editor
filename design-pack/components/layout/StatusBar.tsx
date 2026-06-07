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

  const isDirty = activeTab?.isDirty ?? false;

  return (
    <footer className="status-bar">
      <span className="status-item status-path">
        {activeTab?.path ?? activeTab?.title ?? "No file"}
      </span>
      <span className="status-spacer" />
      <span className="status-item">{formatCount(words)} words</span>
      <span className="status-item status-sep" aria-hidden>·</span>
      <span className="status-item">{formatCount(characters)} chars</span>
      <span className="status-item status-sep" aria-hidden>·</span>
      <span
        className={`status-item status-save ${isDirty ? "modified" : "saved"}`}
      >
        {isDirty && <span className="status-dot" aria-hidden />}
        {isDirty ? "Modified" : "Saved"}
      </span>

      <style>{`
        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          height: 28px;
          font-size: 11px;
          background: var(--status-bg);
          color: var(--text-secondary);
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .status-path {
          max-width: 40%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-secondary);
        }
        .status-item {
          white-space: nowrap;
        }
        .status-sep {
          color: var(--text-muted);
          user-select: none;
        }
        .status-save {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .status-save.modified {
          color: var(--status-modified);
        }
        .status-save.saved {
          color: var(--text-muted);
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-modified);
          flex-shrink: 0;
        }
        .status-spacer {
          flex: 1;
        }
      `}</style>
    </footer>
  );
}
