import { marked } from "marked";
import hljs from "highlight.js/lib/common";
import {
  parseInlineWithoutFootnotes,
  preprocessFootnotes,
} from "./footnotes";
import { escapeCode } from "./utils";

const BLOCK_MATH_MARKER_PATTERN = /^\$\$/m;
const BLOCK_MATH_PATTERN = /^\$\$[ \t]*\n?([\s\S]*?)\n?\$\$[ \t]*(?:\n|$)/;
const DEFINITION_LIST_ITEM_PATTERN = /^:[ \t]+(.*)$/;
const SUPERSCRIPT_PATTERN = /^\^(?!\s)([^^\n]*?\S)\^(?!\^)/;
const SUBSCRIPT_PATTERN = /^~(?!~)(?!\s)([^~\n]*?\S)~(?!~)/;
const HIGHLIGHT_PATTERN = /^==(?=\S)([\s\S]*?\S)==/;
const MARKDOWN_LIST_MARKER_PATTERN = /^(\s*)(?:[-*+]\s+|\d+\.\s+|>\s+)/;
const EMPTY_LINE_PATTERN = /^\s*$/;

function renderDefinitionContent(content: string): string {
  const paragraphs = String(content || "")
    .split(/\n(?:[ \t]*\n)+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => {
      const rendered = parseInlineWithoutFootnotes(paragraph);
      return `<p>${rendered}</p>`;
    })
    .join("");
}

const blockMathExtension = {
  name: "blockMath",
  level: "block" as const,
  start(src: string) {
    const match = src.match(BLOCK_MATH_MARKER_PATTERN);
    return match?.index;
  },
  tokenizer(src: string) {
    const match = BLOCK_MATH_PATTERN.exec(src);
    if (!match) return undefined;
    return {
      type: "blockMath",
      raw: match[0],
      text: match[1],
    };
  },
  renderer(token: { text: string }) {
    return `<div class="math-block">$$\n${token.text}\n$$</div>\n`;
  },
};

const definitionListExtension = {
  name: "definitionList",
  level: "block" as const,
  start(src: string) {
    const match = src.match(/\n:[ \t]+/);
    return match?.index !== undefined ? match.index + 1 : undefined;
  },
  tokenizer(src: string) {
    const lines = src.split("\n");
    if (lines.length < 2) return undefined;

    const term = lines[0];
    if (EMPTY_LINE_PATTERN.test(term) || MARKDOWN_LIST_MARKER_PATTERN.test(term)) {
      return undefined;
    }
    if (!DEFINITION_LIST_ITEM_PATTERN.test(lines[1])) return undefined;

    const definitions: string[] = [];
    const rawLines = [term];
    let index = 1;

    while (index < lines.length) {
      const itemMatch = DEFINITION_LIST_ITEM_PATTERN.exec(lines[index]);
      if (!itemMatch) break;

      rawLines.push(lines[index]);
      const definitionLines = [itemMatch[1]];
      index += 1;

      while (index < lines.length) {
        const line = lines[index];
        if (DEFINITION_LIST_ITEM_PATTERN.test(line)) break;
        if (EMPTY_LINE_PATTERN.test(line)) {
          const nextLine = lines[index + 1] || "";
          if (/^(?: {2,}|\t)/.test(nextLine)) {
            rawLines.push(line);
            definitionLines.push("");
            index += 1;
            continue;
          }
          break;
        }
        const continuationMatch = /^(?: {2,}|\t)(.*)$/.exec(line);
        if (!continuationMatch) break;
        rawLines.push(line);
        definitionLines.push(continuationMatch[1]);
        index += 1;
      }

      definitions.push(definitionLines.join("\n").trim());
    }

    if (definitions.length === 0) return undefined;

    let raw = rawLines.join("\n");
    if (src.startsWith(raw + "\n")) raw += "\n";

    return {
      type: "definitionList",
      raw,
      term: term.trim(),
      definitions,
    };
  },
  renderer(token: { term: string; definitions: string[] }) {
    const termHtml = parseInlineWithoutFootnotes(token.term);
    const definitionHtml = token.definitions
      .map((def) => `<dd>${renderDefinitionContent(def)}</dd>`)
      .join("");
    return `<dl><dt>${termHtml}</dt>${definitionHtml}</dl>\n`;
  },
};

const superscriptExtension = {
  name: "superscript",
  level: "inline" as const,
  start(src: string) {
    const index = src.indexOf("^");
    return index >= 0 ? index : undefined;
  },
  tokenizer(src: string) {
    const match = SUPERSCRIPT_PATTERN.exec(src);
    if (!match) return undefined;
    return { type: "superscript", raw: match[0], text: match[1] };
  },
  renderer(token: { text: string }) {
    return `<sup>${marked.parseInline(token.text)}</sup>`;
  },
};

const subscriptExtension = {
  name: "subscript",
  level: "inline" as const,
  start(src: string) {
    const index = src.indexOf("~");
    return index >= 0 ? index : undefined;
  },
  tokenizer(src: string) {
    const match = SUBSCRIPT_PATTERN.exec(src);
    if (!match) return undefined;
    return { type: "subscript", raw: match[0], text: match[1] };
  },
  renderer(token: { text: string }) {
    return `<sub>${marked.parseInline(token.text)}</sub>`;
  },
};

const highlightExtension = {
  name: "highlight",
  level: "inline" as const,
  start(src: string) {
    const index = src.indexOf("==");
    return index >= 0 ? index : undefined;
  },
  tokenizer(src: string) {
    const match = HIGHLIGHT_PATTERN.exec(src);
    if (!match) return undefined;
    return { type: "highlight", raw: match[0], text: match[1] };
  },
  renderer(token: { text: string }) {
    return `<mark>${marked.parseInline(token.text)}</mark>`;
  },
};

let configured = false;

export function configureMarked(): void {
  if (configured) return;
  configured = true;

  marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
  });

  marked.use({
    extensions: [
      blockMathExtension,
      definitionListExtension,
      superscriptExtension,
      subscriptExtension,
      highlightExtension,
    ],
    hooks: {
      preprocess(markdown) {
        return preprocessFootnotes(markdown);
      },
    },
    renderer: {
      code({ text, lang }) {
        const language = (lang ?? "").trim().toLowerCase();

        if (language === "mermaid") {
          const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
          const escaped = escapeCode(text);
          return (
            `<div class="mermaid-container is-loading">` +
            `<div class="mermaid" id="${id}" data-original-code="${encodeURIComponent(text)}">${escaped}</div>` +
            `</div>`
          );
        }

        if (language && hljs.getLanguage(language)) {
          const highlighted = hljs.highlight(text, { language }).value;
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
        }

        const highlighted = hljs.highlightAuto(text).value;
        return `<pre><code class="hljs">${highlighted}</code></pre>`;
      },
    },
  });
}
