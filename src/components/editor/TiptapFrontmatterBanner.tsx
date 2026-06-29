import { parseDocumentFrontmatter } from "../../lib/editor/tiptap/documentContent";

interface TiptapFrontmatterBannerProps {
  content: string;
}

export function TiptapFrontmatterBanner({ content }: TiptapFrontmatterBannerProps) {
  const { frontmatter } = parseDocumentFrontmatter(content);
  if (!frontmatter) return null;

  const keys = Object.keys(frontmatter);
  const summary =
    keys.length === 0
      ? "YAML frontmatter"
      : keys.slice(0, 4).join(", ") + (keys.length > 4 ? ` +${keys.length - 4}` : "");

  return (
    <div className="tiptap-frontmatter-banner" role="note">
      <div className="tiptap-content-column tiptap-frontmatter-banner-inner">
        <span className="tiptap-frontmatter-label">Frontmatter</span>
        <span className="tiptap-frontmatter-summary">{summary}</span>
        <span className="tiptap-frontmatter-hint">แก้ใน Source mode</span>
      </div>
    </div>
  );
}
