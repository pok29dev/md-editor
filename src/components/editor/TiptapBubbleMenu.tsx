import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { useAppStore } from "../../stores/appStore";
import { getFormatIcons } from "../../lib/theme/icons";
import { runFormatAction } from "../../hooks/useMarkdownFormat";
import { openLinkDialog } from "../../stores/editorStore";
import "../../styles/tiptap-bubble.css";

interface TiptapBubbleMenuProps {
  editor: Editor;
}

export function TiptapBubbleMenu({ editor }: TiptapBubbleMenuProps) {
  const theme = useAppStore((s) => s.theme);
  const {
    BoldIcon,
    ItalicIcon,
    StrikethroughIcon,
    CodeIcon,
    HighlightIcon,
    LinkIcon,
  } = getFormatIcons(theme);

  return (
    <BubbleMenu
      editor={editor}
      className="tiptap-bubble-menu"
      shouldShow={({ editor: activeEditor, from, to }) =>
        activeEditor.isEditable && from !== to
      }
    >
      <button
        type="button"
        className={`tiptap-bubble-btn${activeClass(editor.isActive("bold"))}`}
        title="Bold"
        onMouseDown={(event) => {
          event.preventDefault();
          runFormatAction("bold");
        }}
      >
        <BoldIcon className="tiptap-bubble-icon" />
      </button>
      <button
        type="button"
        className={`tiptap-bubble-btn${activeClass(editor.isActive("italic"))}`}
        title="Italic"
        onMouseDown={(event) => {
          event.preventDefault();
          runFormatAction("italic");
        }}
      >
        <ItalicIcon className="tiptap-bubble-icon" />
      </button>
      <button
        type="button"
        className={`tiptap-bubble-btn${activeClass(editor.isActive("strike"))}`}
        title="Strikethrough"
        onMouseDown={(event) => {
          event.preventDefault();
          runFormatAction("strikethrough");
        }}
      >
        <StrikethroughIcon className="tiptap-bubble-icon" />
      </button>
      <button
        type="button"
        className={`tiptap-bubble-btn${activeClass(editor.isActive("code"))}`}
        title="Inline code"
        onMouseDown={(event) => {
          event.preventDefault();
          runFormatAction("code");
        }}
      >
        <CodeIcon className="tiptap-bubble-icon" />
      </button>
      <button
        type="button"
        className={`tiptap-bubble-btn${activeClass(editor.isActive("highlight"))}`}
        title="Highlight"
        onMouseDown={(event) => {
          event.preventDefault();
          runFormatAction("highlight");
        }}
      >
        <HighlightIcon className="tiptap-bubble-icon" />
      </button>
      <button
        type="button"
        className="tiptap-bubble-btn"
        title="Link"
        onMouseDown={(event) => {
          event.preventDefault();
          openLinkDialog();
        }}
      >
        <LinkIcon className="tiptap-bubble-icon" />
      </button>
    </BubbleMenu>
  );
}

function activeClass(active: boolean): string {
  return active ? " tiptap-bubble-btn--active" : "";
}
