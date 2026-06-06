export interface MarkdownBlock {
  source: string;
  startLine: number;
  endLine: number;
}

export interface SegmentedBlockResult {
  id: string;
  hash: string;
  html: string;
  htmlLength: number;
  sourceLength: number;
  source: string;
  startLine: number;
  endLine: number;
}

export interface SegmentedRenderResult {
  mode: "segmented";
  blocks: SegmentedBlockResult[];
  blockCount: number;
}

export interface FullRequiredResult {
  mode: "full-required";
  reason: string;
}

export type SegmentedParseResult = SegmentedRenderResult | FullRequiredResult;

export function isSegmentedPreviewSafe(markdown: string): boolean {
  if (/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(markdown)) return false;
  if (/^\[[^\]\n]+\]:\s+\S+/m.test(markdown)) return false;
  if (/\[\^[^\]\n]+\]/.test(markdown)) return false;
  if (/\n:[ \t]+/.test(markdown)) return false;
  if (/^\s{0,3}<\/?[a-zA-Z][\w:-]*(?:\s|>|\/>)/m.test(markdown)) return false;
  return true;
}

export function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function splitMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const normalized = String(markdown || "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const blocks: MarkdownBlock[] = [];
  let buffer: string[] = [];
  let startLine = 1;
  let inFence = false;
  let fenceChar = "";
  let fenceLength = 0;
  let inMathBlock = false;

  function flush(endLine: number): void {
    const source = buffer.join("\n").trimEnd();
    if (source.trim()) {
      blocks.push({ source, startLine, endLine });
    }
    buffer = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    const trimmed = line.trim();

    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceChar = marker[0];
        fenceLength = marker.length;
      } else if (marker[0] === fenceChar && marker.length >= fenceLength) {
        inFence = false;
      }
    }

    if (!inFence && trimmed === "$$") {
      inMathBlock = !inMathBlock;
    }

    if (!inFence && !inMathBlock && trimmed === "") {
      flush(lineNumber);
      startLine = lineNumber + 1;
      continue;
    }

    if (buffer.length === 0) startLine = lineNumber;
    buffer.push(line);
  }

  flush(lines.length);
  return blocks;
}

export function renderSegmentedMarkdown(
  markdown: string,
  minimumBlocks = 8,
  parseBlock: (source: string) => string,
): SegmentedParseResult {
  if (!isSegmentedPreviewSafe(markdown)) {
    return { mode: "full-required", reason: "unsafe-markdown" };
  }

  const blocks = splitMarkdownBlocks(markdown);
  if (blocks.length < minimumBlocks) {
    return { mode: "full-required", reason: "too-few-blocks" };
  }

  const seenHashes = new Map<string, number>();
  const renderedBlocks = blocks.map((block) => {
    const hash = hashString(block.source);
    const seenCount = seenHashes.get(hash) || 0;
    seenHashes.set(hash, seenCount + 1);
    const html = parseBlock(block.source);
    return {
      id: `preview-block-${hash}-${seenCount}`,
      hash,
      html,
      htmlLength: html.length,
      sourceLength: block.source.length,
      source: block.source,
      startLine: block.startLine,
      endLine: block.endLine,
    };
  });

  return {
    mode: "segmented",
    blocks: renderedBlocks,
    blockCount: renderedBlocks.length,
  };
}
