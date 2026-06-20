import { useMemo } from "react";
import { useAppStore } from "../../stores/appStore";
import { supportsPreview } from "../../lib/files/fileKind";
import { validateStructuredContent } from "../../lib/files/validateStructured";
import { isThclawsView } from "../../lib/appView";

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
  const appView = useAppStore((s) => s.appView);
  const rootFolder = useAppStore((s) => s.rootFolder);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const content = activeTab?.content ?? "";
  const fileKind = activeTab?.fileKind ?? "markdown";
  const thclawsView = isThclawsView(appView);

  const { words, characters } = useMemo(
    () => ({
      words: countWords(content),
      characters: content.length,
    }),
    [content],
  );

  const validation = useMemo(() => {
    if (!activeTab || supportsPreview(fileKind)) {
      return null;
    }
    return validateStructuredContent(fileKind, content);
  }, [activeTab, fileKind, content]);

  const isDirty = activeTab?.isDirty ?? false;

  return (
    <footer className="status-bar">
      {thclawsView ? (
        <>
          <span className="status-item">thClaws</span>
          <span className="status-spacer" />
          <span className="status-item status-path status-path--thclaws">
            {rootFolder ?? "No folder open"}
          </span>
        </>
      ) : (
        <>
          <span className="status-item status-path">
            {activeTab?.path ?? activeTab?.title ?? "No file"}
          </span>
          {validation && !validation.valid && (
            <>
              <span className="status-item status-sep" aria-hidden>·</span>
              <span
                className="status-item status-error"
                title={validation.message ?? undefined}
              >
                Syntax error
              </span>
            </>
          )}
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
        </>
      )}

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
        .status-path--thclaws {
          max-width: 60%;
        }
        .status-item {
          white-space: nowrap;
        }
        .status-error {
          color: var(--status-modified);
          max-width: 30%;
          overflow: hidden;
          text-overflow: ellipsis;
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
