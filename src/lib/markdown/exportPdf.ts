import githubMarkdownCss from "github-markdown-css/github-markdown.css?inline";
import highlightCss from "highlight.js/styles/github.min.css?inline";
import { renderMarkdown } from "./renderer";
import { enhanceGitHubAlerts } from "./alerts";
import { applyReferencePreviewLinks } from "./references";
import { renderMermaid, initMermaid } from "./mermaid";
import { renderMathJax, hasMathContent } from "./mathjax";
import {
  getExportPageWidthMm,
  normalizeExportPdfPageSize,
  type ExportPdfPageSize,
} from "./exportSettings";

const PAGE_MARGIN_MM = 15;
const CAPTURE_SCALE = 2;

function buildExportExtraStyles(pageWidthMm: number): string {
  return `
  .pdf-export-root {
    position: fixed;
    left: -10000px;
    top: 0;
    z-index: -1;
    pointer-events: none;
  }
  .pdf-export-root .markdown-body {
    box-sizing: border-box;
    min-width: 0;
    padding: 20px;
    width: ${pageWidthMm}mm;
    font-size: 14px;
    line-height: 1.6;
  }
  .pdf-export-root .markdown-body[data-theme="dark"] {
    color-scheme: dark;
    background: #0d1117;
    color: #c9d1d9;
  }
  .pdf-export-root .markdown-body[data-theme="light"] {
    color-scheme: light;
    background: #ffffff;
    color: #24292e;
  }
  .pdf-export-root .frontmatter-table {
    margin-bottom: 1.5em;
    padding: 12px 16px;
    border: 1px solid #d1d1d6;
    border-radius: 6px;
    font-size: 13px;
  }
  .pdf-export-root .markdown-alert {
    padding: 12px 16px;
    margin: 16px 0;
    border-left: 4px solid;
    border-radius: 0 6px 6px 0;
  }
  .pdf-export-root .markdown-alert-note { border-color: #0969da; }
  .pdf-export-root .markdown-alert-tip { border-color: #1a7f37; }
  .pdf-export-root .markdown-alert-important { border-color: #8250df; }
  .pdf-export-root .markdown-alert-warning { border-color: #9a6700; }
  .pdf-export-root .markdown-alert-caution { border-color: #cf222e; }
  .pdf-export-root .mermaid-container.is-loading::after {
    display: none;
  }
  .pdf-export-root mjx-assistive-mml {
    display: none !important;
  }
`;
}

export class PdfExportCancelledError extends Error {
  constructor() {
    super("PDF generation cancelled.");
    this.name = "PdfExportCancelledError";
  }
}

export interface PdfExportProgress {
  percent: number;
  step: string;
}

export interface BuildPdfOptions {
  markdown: string;
  isDark: boolean;
  pageSize?: ExportPdfPageSize;
  onProgress?: (progress: PdfExportProgress) => void;
  signal?: AbortSignal;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new PdfExportCancelledError();
}

function waitFrame(signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function report(onProgress: BuildPdfOptions["onProgress"], percent: number, step: string) {
  onProgress?.({ percent, step });
}

function chooseCanvasScale(element: HTMLElement): number {
  const area = element.offsetWidth * element.scrollHeight;
  if (area > 14_000_000) return 1.25;
  if (area > 8_000_000) return 1.5;
  return CAPTURE_SCALE;
}

function hideMathAssistiveElements(root: HTMLElement) {
  root.querySelectorAll("mjx-assistive-mml").forEach((el) => el.remove());
  root
    .querySelectorAll('script[type*="math"], script[type*="tex"]')
    .forEach((el) => el.remove());
}

function createExportRoot(
  isDark: boolean,
  html: string,
  pageWidthMm: number,
): HTMLElement {
  const root = document.createElement("div");
  root.className = "pdf-export-root";

  const style = document.createElement("style");
  style.textContent = `${githubMarkdownCss}\n${highlightCss}\n${buildExportExtraStyles(pageWidthMm)}`;
  root.appendChild(style);

  const parsed = document.createElement("div");
  parsed.innerHTML = html;
  const body = parsed.querySelector<HTMLElement>(".markdown-body");
  if (!body) {
    throw new Error("Failed to prepare export document.");
  }
  body.setAttribute("data-theme", isDark ? "dark" : "light");
  body.setAttribute("data-color-mode", isDark ? "dark" : "light");
  root.appendChild(body);

  document.body.appendChild(root);
  return root;
}

function cleanupExportRoot(root: HTMLElement | null) {
  root?.remove();
}

async function loadPdfLibraries() {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  return { jsPDF, html2canvas: html2canvasModule.default };
}

export async function buildPdfBytes(options: BuildPdfOptions): Promise<Uint8Array> {
  const { markdown, isDark, onProgress, signal } = options;
  const pageSize = normalizeExportPdfPageSize(options.pageSize ?? "a4");
  const pageWidthMm = getExportPageWidthMm(pageSize);
  let root: HTMLElement | null = null;

  try {
    report(onProgress, 5, "Parsing markdown");
    throwIfAborted(signal);
    await waitFrame(signal);

    const result = renderMarkdown(markdown);
    report(onProgress, 15, "Preparing document");
    await waitFrame(signal);

    root = createExportRoot(isDark, result.html, pageWidthMm);
    const body = root.querySelector<HTMLElement>(".markdown-body");
    if (!body) throw new Error("Failed to prepare export document.");

    enhanceGitHubAlerts(body);
    applyReferencePreviewLinks(body, result.references);
    await waitFrame(signal);

    if (result.hasMermaid) {
      report(onProgress, 30, "Rendering diagrams");
      initMermaid(isDark);
      await renderMermaid(body, isDark);
      throwIfAborted(signal);
      await waitFrame(signal);
    }

    if (result.hasMath && hasMathContent(markdown)) {
      report(onProgress, 45, "Rendering math");
      await renderMathJax(body);
      hideMathAssistiveElements(body);
      throwIfAborted(signal);
      await waitFrame(signal);
    }

    report(onProgress, 55, "Loading PDF libraries");
    const { jsPDF, html2canvas } = await loadPdfLibraries();
    throwIfAborted(signal);

    report(onProgress, 60, "Capturing document");
    const scale = chooseCanvasScale(body);
    const canvas = await html2canvas(body, {
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: isDark ? "#0d1117" : "#ffffff",
      windowWidth: Math.max(1000, Math.ceil(body.getBoundingClientRect().width)),
      windowHeight: body.scrollHeight,
    });
    throwIfAborted(signal);
    await waitFrame(signal);

    report(onProgress, 75, "Building PDF");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: pageSize,
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PAGE_MARGIN_MM * 2;
    const contentHeight = pageHeight - PAGE_MARGIN_MM * 2;
    const scaleFactor = canvas.width / contentWidth;
    const imgHeightMm = canvas.height / scaleFactor;
    const pageCount = Math.max(1, Math.ceil(imgHeightMm / contentHeight));

    for (let page = 0; page < pageCount; page++) {
      throwIfAborted(signal);
      report(
        onProgress,
        75 + ((page + 1) / pageCount) * 20,
        `Rendering page ${page + 1} of ${pageCount}`,
      );

      if (page > 0) pdf.addPage();

      const sourceY = page * contentHeight * scaleFactor;
      const sourceHeight = Math.min(
        canvas.height - sourceY,
        contentHeight * scaleFactor,
      );
      const destHeight = sourceHeight / scaleFactor;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const ctx = pageCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable.");
      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceHeight,
        0,
        0,
        canvas.width,
        sourceHeight,
      );

      pdf.addImage(
        pageCanvas.toDataURL("image/png"),
        "PNG",
        PAGE_MARGIN_MM,
        PAGE_MARGIN_MM,
        contentWidth,
        destHeight,
      );
      await waitFrame(signal);
    }

    report(onProgress, 100, "Complete");
    return new Uint8Array(pdf.output("arraybuffer"));
  } finally {
    cleanupExportRoot(root);
  }
}
