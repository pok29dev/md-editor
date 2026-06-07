import { useEffect, useRef } from "react";
import { useAppStore } from "../../stores/appStore";
import { parseFrontmatter } from "../../lib/markdown/frontmatter";
import { renderMarkdown } from "../../lib/markdown/renderer";
import { enhanceGitHubAlerts } from "../../lib/markdown/alerts";
import { applyReferencePreviewLinks } from "../../lib/markdown/references";
import { renderMermaid, forceMermaidTheme } from "../../lib/markdown/mermaid";
import { renderMathJax } from "../../lib/markdown/mathjax";

interface MarkdownHelpViewProps {
  content: string;
}

export function MarkdownHelpView({ content }: MarkdownHelpViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedColorScheme = useAppStore((s) => s.resolvedColorScheme);
  const isDark = resolvedColorScheme === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { body } = parseFrontmatter(content);
    const result = renderMarkdown(body);
    container.innerHTML = result.html;

    const bodyEl = container.querySelector<HTMLElement>(".markdown-body");
    if (!bodyEl) return;

    bodyEl.setAttribute("data-color-mode", isDark ? "dark" : "light");
    enhanceGitHubAlerts(bodyEl);
    applyReferencePreviewLinks(bodyEl, result.references);

    let cancelled = false;
    void (async () => {
      if (result.hasMermaid) {
        forceMermaidTheme(isDark);
        await renderMermaid(container, isDark);
      }
      if (!cancelled && result.hasMath) {
        await renderMathJax(container);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [content, isDark]);

  return (
    <div
      ref={containerRef}
      className="toolbar-help-preview preview-content"
      aria-label="Markdown syntax reference"
    />
  );
}
