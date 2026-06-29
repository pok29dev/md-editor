const MERMAID_FENCE_RE = /```mermaid[ \t]*\r?\n([\s\S]*?)```/;
const MATH_BLOCK_RE = /\$\$[ \t]*\r?\n?([\s\S]*?)\r?\n?\$\$/;
const ALERT_START_RE = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i;
const FOOTNOTE_DEF_RE = /^([ \t]{0,3})\[\^([^\]\n]+)\]:[ \t]*(.*)$/;

export function extractMermaidCode(raw: string): string {
  const match = MERMAID_FENCE_RE.exec(raw);
  return match?.[1]?.trim() ?? raw.trim();
}

export function extractMathBlockCode(raw: string): string {
  const match = MATH_BLOCK_RE.exec(raw);
  return match?.[1]?.trim() ?? raw.trim();
}

export function parseAlertPreview(raw: string): {
  type: string;
  label: string;
  body: string;
} {
  const lines = raw.split("\n").map((line) => line.replace(/^>\s?/, ""));
  const first = lines[0] ?? "";
  const typeMatch = ALERT_START_RE.exec(first);
  const type = typeMatch?.[1]?.toLowerCase() ?? "note";
  const body = lines
    .slice(1)
    .join("\n")
    .replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/i, "")
    .trim();
  return { type, label: typeMatch?.[1] ?? "NOTE", body };
}

export function parseFootnoteDefPreview(raw: string): {
  id: string;
  text: string;
} {
  const match = FOOTNOTE_DEF_RE.exec(raw);
  return {
    id: match?.[2]?.trim() ?? "footnote",
    text: (match?.[3] ?? raw).trim(),
  };
}

export function preservedKindLabel(kind: string): string {
  if (kind.startsWith("alert-")) return "GitHub alert";
  if (kind === "mermaid") return "Mermaid diagram";
  if (kind === "math-block") return "Math block";
  if (kind === "footnote-def") return "Footnote definition";
  if (kind === "definition-list") return "Definition list";
  return "Markdown block";
}
