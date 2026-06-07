import { marked } from "marked";
import { parseFrontmatter, renderFrontmatterTable } from "./frontmatter";
import { configureMarked } from "./extensions";
import {
  extractReferenceDefinitions,
  type ReferenceDefinition,
} from "./references";
import { hasMathContent } from "./mathjax";

configureMarked();

export type SerializedReference = [number, ReferenceDefinition];

export interface RawRenderResult {
  bodyHtml: string;
  hasMermaid: boolean;
  hasMath: boolean;
  references: SerializedReference[];
}

function serializeReferences(
  definitions: Map<number, ReferenceDefinition>,
): SerializedReference[] {
  return Array.from(definitions.entries());
}

export function renderMarkdownCore(content: string): RawRenderResult {
  const emptyReferences: SerializedReference[] = [];

  if (!content.trim()) {
    return {
      bodyHtml:
        '<div class="workspace-empty preview-empty"><p class="workspace-empty-title">No preview</p><p class="workspace-empty-hint">Start writing markdown to see the preview</p></div>',
      hasMermaid: false,
      hasMath: false,
      references: emptyReferences,
    };
  }

  const { frontmatter, body } = parseFrontmatter(content);
  const referenceData = extractReferenceDefinitions(body);
  const rawHtml = marked.parse(referenceData.cleanedMarkdown, {
    async: false,
  }) as string;

  let bodyHtml = rawHtml;
  if (frontmatter && Object.keys(frontmatter).length > 0) {
    bodyHtml = renderFrontmatterTable(frontmatter) + bodyHtml;
  }

  const hasMermaid =
    bodyHtml.includes('class="mermaid"') ||
    bodyHtml.includes("class='mermaid'");
  const hasMath = hasMathContent(body);

  return {
    bodyHtml,
    hasMermaid,
    hasMath,
    references: serializeReferences(referenceData.definitions),
  };
}

export function referencesToMap(
  references: SerializedReference[],
): Map<number, ReferenceDefinition> {
  return new Map(references);
}
