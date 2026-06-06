import DOMPurify from "dompurify";
import type { Config } from "dompurify";

const SANITIZE_OPTIONS: Config = {
  ADD_TAGS: [
    "mjx-container",
    "mjx-assistive-mml",
    "svg",
    "path",
    "g",
    "circle",
    "rect",
    "line",
    "text",
    "foreignObject",
    "defs",
    "marker",
    "use",
    "clipPath",
    "input",
  ],
  ADD_ATTR: [
    "id",
    "class",
    "style",
    "align",
    "type",
    "checked",
    "disabled",
    "xmlns",
    "viewBox",
    "d",
    "fill",
    "stroke",
    "stroke-width",
    "transform",
    "data-processed",
    "data-mermaid",
    "data-original-code",
    "aria-hidden",
    "focusable",
    "role",
    "tabindex",
  ],
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto|tel|blob|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS) as string;
}
