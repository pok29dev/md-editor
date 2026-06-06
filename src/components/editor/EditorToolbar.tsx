import { type MouseEvent } from "react";
import type { FormatActionId } from "../../lib/editor/formatActions";
import type { HeadingLevelValue } from "../../lib/editor/headingLevel";
import { useEditorToolbarState } from "../../hooks/useEditorToolbarState";
import { useMarkdownFormat } from "../../hooks/useMarkdownFormat";
import { openLinkDialog } from "../../stores/editorStore";
import "../../styles/editor-toolbar.css";

const HEADING_OPTIONS: { value: HeadingLevelValue; label: string }[] = [
  { value: "body", label: "Body" },
  { value: "heading1", label: "Heading 1" },
  { value: "heading2", label: "Heading 2" },
  { value: "heading3", label: "Heading 3" },
  { value: "heading4", label: "Heading 4" },
  { value: "heading5", label: "Heading 5" },
];

interface ToolbarButton {
  id: FormatActionId;
  label: string;
  title: string;
}

const INLINE_BUTTONS: ToolbarButton[] = [
  { id: "bold", label: "B", title: "Bold (⌘B)" },
  { id: "italic", label: "I", title: "Italic (⌘I)" },
  { id: "code", label: "<>", title: "Inline code" },
  { id: "highlight", label: "==", title: "Highlight" },
  { id: "strikethrough", label: "~~", title: "Strikethrough" },
];

const LIST_BUTTONS: ToolbarButton[] = [
  { id: "bulletList", label: "•", title: "Bullet list" },
  { id: "numberedList", label: "1.", title: "Numbered list" },
  { id: "taskList", label: "☐", title: "Task list (⌘L)" },
];

const INSERT_BUTTONS: (ToolbarButton | { id: "linkDialog"; label: string; title: string })[] = [
  { id: "linkDialog", label: "Link", title: "Insert link (⌘K)" },
  { id: "codeBlock", label: "{ }", title: "Code block" },
  { id: "mathBlock", label: "∑", title: "Math block" },
  { id: "table", label: "Table", title: "Insert table" },
];

function keepEditorSelection(event: MouseEvent) {
  event.preventDefault();
}

function activeClass(isActive: boolean) {
  return isActive ? " editor-toolbar-btn--active" : "";
}

export function EditorToolbar() {
  const { format, hasEditor } = useMarkdownFormat();
  const { headingLevel, activeInline, activeList } = useEditorToolbarState();

  const run = (actionId: FormatActionId) => {
    format(actionId);
  };

  const runOnMouseDown = (event: MouseEvent, actionId: FormatActionId) => {
    keepEditorSelection(event);
    run(actionId);
  };

  const runInsert = (event: MouseEvent, id: string) => {
    keepEditorSelection(event);
    if (id === "linkDialog") {
      openLinkDialog();
      return;
    }
    run(id as FormatActionId);
  };

  return (
    <div
      className="editor-toolbar"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      <select
        className="editor-toolbar-select"
        value={headingLevel}
        disabled={!hasEditor}
        aria-label="Heading level"
        title="Heading level"
        onChange={(event) => run(event.target.value as HeadingLevelValue)}
      >
        {HEADING_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="editor-toolbar-group" role="group" aria-label="Inline styles">
        {INLINE_BUTTONS.map(({ id, label, title }) => (
          <button
            key={id}
            type="button"
            className={`editor-toolbar-btn editor-toolbar-btn--compact${activeClass(activeInline[id as keyof typeof activeInline])}`}
            title={title}
            disabled={!hasEditor}
            aria-pressed={activeInline[id as keyof typeof activeInline]}
            onMouseDown={(event) => runOnMouseDown(event, id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="editor-toolbar-divider" aria-hidden />

      <div className="editor-toolbar-group" role="group" aria-label="Lists">
        {LIST_BUTTONS.map(({ id, label, title }) => (
          <button
            key={id}
            type="button"
            className={`editor-toolbar-btn editor-toolbar-btn--compact${activeClass(activeList[id as keyof typeof activeList])}`}
            title={title}
            disabled={!hasEditor}
            aria-pressed={activeList[id as keyof typeof activeList]}
            onMouseDown={(event) => runOnMouseDown(event, id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="editor-toolbar-divider" aria-hidden />

      <div className="editor-toolbar-group" role="group" aria-label="Insert blocks">
        {INSERT_BUTTONS.map(({ id, label, title }) => (
          <button
            key={id}
            type="button"
            className="editor-toolbar-btn"
            title={title}
            disabled={!hasEditor}
            onMouseDown={(event) => runInsert(event, id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
