import { sanitizeHtml } from "./sanitize";
import {
  referencesToMap,
  renderMarkdownCore,
  type RawRenderResult,
} from "./renderCore";
import {
  buildSegmentedPreviewHtml,
  type PatchResult,
} from "./previewPatch";
import type { ReferenceDefinition } from "./references";
import type { SegmentedParseResult } from "./segmented";

export interface RenderResult {
  html: string;
  hasMermaid: boolean;
  hasMath: boolean;
  references: Map<number, ReferenceDefinition>;
  segmented: boolean;
}

function finalizeRawResult(raw: RawRenderResult): RenderResult {
  const sanitized = sanitizeHtml(raw.bodyHtml);
  const hasMermaid =
    sanitized.includes('class="mermaid"') ||
    sanitized.includes("class='mermaid'");

  return {
    html: `<div class="markdown-body">${sanitized}</div>`,
    hasMermaid,
    hasMath: raw.hasMath,
    references: referencesToMap(raw.references),
    segmented: false,
  };
}

export function renderMarkdown(content: string): RenderResult {
  return finalizeRawResult(renderMarkdownCore(content));
}

export function finalizeWorkerResult(
  workerResult: RawRenderResult | SegmentedParseResult,
  segmentCache: Map<string, string>,
): RenderResult {
  if ("mode" in workerResult) {
    if (workerResult.mode === "full-required") {
      return renderMarkdown("");
    }

    const html = buildSegmentedPreviewHtml(workerResult.blocks, segmentCache);
    const hasMermaid = html.includes('class="mermaid"');
    const hasMath = /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\(|\\\[/.test(
      workerResult.blocks.map((block) => block.source).join("\n"),
    );

    return {
      html,
      hasMermaid,
      hasMath,
      references: new Map(),
      segmented: true,
    };
  }

  return finalizeRawResult(workerResult);
}

export type { PatchResult };
