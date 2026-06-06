import { renderMarkdown } from "./renderer";

const BASE_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px;
    line-height: 1.6;
    color: #1d1d1f;
    background: #fff;
  }
  .markdown-body { box-sizing: border-box; min-width: 200px; }
  pre { overflow-x: auto; padding: 12px; border-radius: 6px; background: #f5f5f7; }
  code { font-family: "SF Mono", Consolas, monospace; font-size: 0.9em; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #d1d1d6; padding: 6px 12px; }
  .frontmatter-table { margin-bottom: 1.5em; padding: 12px; background: #f5f5f7; border-radius: 6px; }
  .markdown-alert { padding: 12px 16px; margin: 16px 0; border-left: 4px solid; border-radius: 0 6px 6px 0; }
  .markdown-alert-note { border-color: #0969da; }
  .markdown-alert-tip { border-color: #1a7f37; }
  .markdown-alert-important { border-color: #8250df; }
  .markdown-alert-warning { border-color: #9a6700; }
  .markdown-alert-caution { border-color: #cf222e; }
`;

export function buildStandaloneHtml(markdown: string, title = "Document"): string {
  const { html } = renderMarkdown(markdown);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  ${html}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
