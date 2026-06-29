import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import {
  finalizeTiptapMarkdown,
  getTiptapMarkdown,
  prepareTiptapBody,
} from "./markdown";
import { buildTiptapExtensions } from "./extensions";

const SAMPLE_DOCS_DIR = join(process.cwd(), "examples/sample-docs");

function listMarkdownFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
      continue;
    }
    if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractPreservedRawBlocks(prepared: string): string[] {
  const blocks: string[] = [];
  const pattern = /data-raw="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(prepared)) !== null) {
    blocks.push(decodeURIComponent(match[1]));
  }
  return blocks;
}

function roundTripWithEditor(body: string): string {
  const editor = new Editor({
    extensions: buildTiptapExtensions(),
    content: prepareTiptapBody(body),
  });
  const markdown = getTiptapMarkdown(editor);
  editor.destroy();
  return markdown;
}

describe("tiptap markdown dialect", () => {
  it("round-trips highlight, superscript, and subscript", () => {
    const input = "Hello ==world== with ^up^ and ~down~";
    const prepared = prepareTiptapBody(input);
    expect(prepared).toContain("<mark>world</mark>");
    expect(finalizeTiptapMarkdown(prepared)).toBe(input);
  });

  it("preserves mermaid and math blocks as encoded widgets", () => {
    const mermaid = "```mermaid\ngraph TD\n  A-->B\n```";
    const math = "$$\nE = mc^2\n$$";
    const body = `${mermaid}\n\n${math}`;
    const prepared = prepareTiptapBody(body);
    const preserved = extractPreservedRawBlocks(prepared);
    expect(preserved).toContain(mermaid);
    expect(preserved).toContain(math);
  });
});

describe("tiptap editor round-trip", () => {
  it("keeps basic headings and lists stable", () => {
    const body = "# Title\n\n- one\n- two\n\nParagraph.";
    const result = roundTripWithEditor(body);
    expect(result).toContain("# Title");
    expect(result).toContain("- one");
    expect(result).toContain("Paragraph.");
  });

  it("round-trips sample docs without losing preserved blocks", () => {
    const files = listMarkdownFiles(SAMPLE_DOCS_DIR);
    expect(files.length).toBeGreaterThan(0);

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf8");
      const prepared = prepareTiptapBody(source);
      const preservedBefore = extractPreservedRawBlocks(prepared);
      const result = roundTripWithEditor(source);
      const preservedAfter = extractPreservedRawBlocks(prepareTiptapBody(result));

      expect(
        preservedAfter.length,
        `${filePath}: preserved block count`,
      ).toBeGreaterThanOrEqual(preservedBefore.length);

      for (const block of preservedBefore) {
        expect(result, `${filePath} should keep preserved content`).toContain(
          block.trim().split("\n")[0]!.slice(0, 24),
        );
      }
    }
  });
});
