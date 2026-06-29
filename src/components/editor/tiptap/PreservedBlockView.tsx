import { useEffect, useRef } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useAppStore } from "../../../stores/appStore";
import { renderMermaid } from "../../../lib/markdown/mermaid";
import { renderMathJax } from "../../../lib/markdown/mathjax";
import {
  extractMathBlockCode,
  extractMermaidCode,
  parseAlertPreview,
  parseFootnoteDefPreview,
  preservedKindLabel,
} from "../../../lib/editor/tiptap/preservedRender";

export function PreservedBlockView({ node, selected }: NodeViewProps) {
  const kind = String(node.attrs.kind ?? "unknown");
  const raw = String(node.attrs.raw ?? "");
  const previewRef = useRef<HTMLDivElement>(null);
  const resolvedColorScheme = useAppStore((s) => s.resolvedColorScheme);
  const isDark = resolvedColorScheme === "dark";

  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    let cancelled = false;
    const run = async () => {
      if (kind === "mermaid") {
        await renderMermaid(container, isDark);
      } else if (kind === "math-block") {
        await renderMathJax(container);
      }
      if (cancelled) return;
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [kind, raw, isDark]);

  return (
    <NodeViewWrapper
      as="div"
      className={`tiptap-preserved-block${selected ? " is-selected" : ""}`}
      data-kind={kind}
    >
      <div className="tiptap-preserved-block__badge">
        {preservedKindLabel(kind)} · แก้ใน Source mode
      </div>
      <div ref={previewRef} className="tiptap-preserved-block__preview">
        {renderPreservedPreview(kind, raw)}
      </div>
    </NodeViewWrapper>
  );
}

function renderPreservedPreview(kind: string, raw: string) {
  if (kind === "mermaid") {
    const code = extractMermaidCode(raw);
    return (
      <div className="mermaid-container">
        <pre className="mermaid">{code}</pre>
      </div>
    );
  }

  if (kind === "math-block") {
    const code = extractMathBlockCode(raw);
    return <div className="math-block">{`$$\n${code}\n$$`}</div>;
  }

  if (kind.startsWith("alert-")) {
    const { type, label, body } = parseAlertPreview(raw);
    return (
      <blockquote className={`markdown-alert markdown-alert-${type}`}>
        <p className="markdown-alert-title">{label}</p>
        {body ? <p>{body}</p> : null}
      </blockquote>
    );
  }

  if (kind === "footnote-def") {
    const { id, text } = parseFootnoteDefPreview(raw);
    return (
      <div className="tiptap-preserved-footnote">
        <code>{`[^${id}]:`}</code> {text || "footnote text"}
      </div>
    );
  }

  if (kind === "definition-list") {
    return <pre className="tiptap-preserved-raw">{raw}</pre>;
  }

  return <pre className="tiptap-preserved-raw">{raw}</pre>;
}
