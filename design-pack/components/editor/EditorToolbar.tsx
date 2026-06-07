import { type ComponentType, type MouseEvent } from "react";
import type { FormatActionId } from "../../lib/editor/formatActions";
import type { HeadingLevelValue } from "../../lib/editor/headingLevel";
import { runEditorRedo, runEditorUndo } from "../../lib/editor/editorHistory";
import { useEditorToolbarState } from "../../hooks/useEditorToolbarState";
import { useMarkdownFormat } from "../../hooks/useMarkdownFormat";
import { insertImageFromMenu } from "../../hooks/useFormatMenuActions";
import {
  openAboutDialog,
  openClearDocumentDialog,
  openEmojiPicker,
  openHelpDialog,
  openLinkDialog,
  openReferenceDialog,
  openSymbolsPicker,
  useEditorStore,
} from "../../stores/editorStore";
import { useAppStore } from "../../stores/appStore";
import { getFormatIcons } from "../../lib/theme/icons";
import { getTabEditorView } from "../../lib/editor/tabEditorCache";
import "../../styles/editor-toolbar.css";

const HEADING_OPTIONS: { value: HeadingLevelValue; label: string }[] = [
  { value: "body", label: "Body" },
  { value: "heading1", label: "Heading 1" },
  { value: "heading2", label: "Heading 2" },
  { value: "heading3", label: "Heading 3" },
  { value: "heading4", label: "Heading 4" },
  { value: "heading5", label: "Heading 5" },
  { value: "heading6", label: "Heading 6" },
];

type SpecialActionId =
  | "undo"
  | "redo"
  | "clearDocument"
  | "linkDialog"
  | "imagePicker"
  | "referenceDialog"
  | "emojiPicker"
  | "symbolsPicker"
  | "toggleDirection"
  | "fullscreen"
  | "findReplace"
  | "help"
  | "about";

type ToolbarActionId = FormatActionId | SpecialActionId;

interface ToolbarButton {
  id: ToolbarActionId;
  title: string;
  Icon?: ComponentType<{ className?: string }>;
  label?: string;
}

function keepEditorSelection(event: MouseEvent) {
  event.preventDefault();
}

function activeClass(isActive: boolean) {
  return isActive ? " editor-toolbar-btn--active" : "";
}

function resolveEditorView() {
  const { view } = useEditorStore.getState();
  if (view) return view;
  const activeTabId = useAppStore.getState().activeTabId;
  if (!activeTabId) return null;
  return getTabEditorView(activeTabId) ?? null;
}

function toggleEditorFullscreen() {
  const pane = document.querySelector(".editor-pane");
  if (!pane || !(pane instanceof HTMLElement)) return;
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void pane.requestFullscreen();
  }
}

export function EditorToolbar() {
  const theme = useAppStore((s) => s.theme);
  const icons = getFormatIcons(theme);
  const { format, hasEditor } = useMarkdownFormat();
  const { headingLevel, activeInline, activeList, canUndo, canRedo } =
    useEditorToolbarState();
  const editorTextDirection = useEditorStore((s) => s.editorTextDirection);
  const toggleEditorTextDirection = useEditorStore((s) => s.toggleEditorTextDirection);
  const setFindReplaceOpen = useEditorStore((s) => s.setFindReplaceOpen);

  const historyButtons: ToolbarButton[] = [
    { id: "undo", title: "Undo (⌘Z)", Icon: icons.UndoIcon },
    { id: "redo", title: "Redo (⌘⇧Z)", Icon: icons.RedoIcon },
    { id: "clearDocument", title: "Clear document", Icon: icons.ClearIcon },
  ];

  const inlineButtons: ToolbarButton[] = [
    { id: "bold", title: "Bold (⌘B)", Icon: icons.BoldIcon },
    { id: "italic", title: "Italic (⌘I)", Icon: icons.ItalicIcon },
    { id: "strikethrough", title: "Strikethrough", Icon: icons.StrikethroughIcon },
    { id: "code", title: "Inline code", Icon: icons.CodeIcon },
    { id: "highlight", title: "Highlight", Icon: icons.HighlightIcon },
    { id: "blockquote", title: "Blockquote", Icon: icons.QuoteIcon },
    { id: "titleCase", title: "Title case", Icon: icons.TitleCaseIcon },
    { id: "uppercase", title: "Uppercase", Icon: icons.UppercaseIcon },
    { id: "lowercase", title: "Lowercase", Icon: icons.LowercaseIcon },
  ];

  const alignButtons: ToolbarButton[] = [
    { id: "alignLeft", title: "Align left", Icon: icons.AlignLeftIcon },
    { id: "alignCenter", title: "Align center", Icon: icons.AlignCenterIcon },
    { id: "alignRight", title: "Align right", Icon: icons.AlignRightIcon },
    {
      id: "toggleDirection",
      title: editorTextDirection === "ltr" ? "Switch to RTL" : "Switch to LTR",
      label: editorTextDirection === "ltr" ? "L" : "R",
    },
  ];

  const listButtons: ToolbarButton[] = [
    { id: "bulletList", title: "Bullet list", Icon: icons.BulletListIcon },
    { id: "numberedList", title: "Numbered list", Icon: icons.NumberedListIcon },
    { id: "taskList", title: "Task list (⌘L)", Icon: icons.TaskListIcon },
    { id: "horizontalRule", title: "Horizontal rule", Icon: icons.HorizontalRuleIcon },
  ];

  const insertButtons: ToolbarButton[] = [
    { id: "linkDialog", title: "Insert link (⌘K)", Icon: icons.LinkIcon },
    { id: "referenceDialog", title: "Insert reference", Icon: icons.ReferenceIcon },
    { id: "imagePicker", title: "Insert image", Icon: icons.ImageIcon },
    { id: "codeBlock", title: "Code block", Icon: icons.CodeBlockIcon },
    { id: "terminalBlock", title: "Terminal block", Icon: icons.TerminalIcon },
    { id: "mathBlock", title: "Math block", Icon: icons.MathBlockIcon },
    { id: "table", title: "Insert table", Icon: icons.TableIcon },
    { id: "dateTime", title: "Insert date and time", Icon: icons.DateTimeIcon },
    { id: "emojiPicker", title: "Insert emoji", Icon: icons.EmojiIcon },
    { id: "symbolsPicker", title: "Insert symbol", Icon: icons.SymbolsIcon },
    { id: "calloutNote", title: "Callout / Alert", Icon: icons.AlertIcon },
    { id: "footnote", title: "Footnote", Icon: icons.FootnoteIcon },
  ];

  const utilityButtons: ToolbarButton[] = [
    { id: "fullscreen", title: "Fullscreen", Icon: icons.FullscreenIcon },
    { id: "findReplace", title: "Find & Replace (⌘F)", Icon: icons.FindIcon },
    { id: "help", title: "Help", Icon: icons.HelpIcon },
    { id: "about", title: "About Markdown", Icon: icons.AboutIcon },
  ];

  const runFormat = (actionId: FormatActionId) => {
    format(actionId);
  };

  const runAction = (event: MouseEvent, id: ToolbarActionId) => {
    keepEditorSelection(event);

    switch (id) {
      case "undo": {
        const view = resolveEditorView();
        if (view) runEditorUndo(view);
        return;
      }
      case "redo": {
        const view = resolveEditorView();
        if (view) runEditorRedo(view);
        return;
      }
      case "clearDocument":
        openClearDocumentDialog();
        return;
      case "linkDialog":
        openLinkDialog();
        return;
      case "imagePicker":
        void insertImageFromMenu();
        return;
      case "referenceDialog":
        openReferenceDialog();
        return;
      case "emojiPicker":
        openEmojiPicker();
        return;
      case "symbolsPicker":
        openSymbolsPicker();
        return;
      case "toggleDirection":
        toggleEditorTextDirection();
        return;
      case "fullscreen":
        toggleEditorFullscreen();
        return;
      case "findReplace":
        setFindReplaceOpen(true);
        return;
      case "help":
        openHelpDialog();
        return;
      case "about":
        openAboutDialog();
        return;
      default:
        runFormat(id);
    }
  };

  const isActive = (id: ToolbarActionId): boolean => {
    if (id === "blockquote") return activeList.blockquote;
    if (id === "toggleDirection") return editorTextDirection === "rtl";
    if (id in activeList) return activeList[id as keyof typeof activeList] ?? false;
    if (id in activeInline) return activeInline[id as keyof typeof activeInline] ?? false;
    return false;
  };

  const isDisabled = (id: ToolbarActionId): boolean => {
    if (!hasEditor) return true;
    if (id === "undo") return !canUndo;
    if (id === "redo") return !canRedo;
    return false;
  };

  const renderGroup = (buttons: ToolbarButton[], ariaLabel: string) => (
    <div className="editor-toolbar-group" role="group" aria-label={ariaLabel}>
      {buttons.map(({ id, title, Icon, label }) => (
        <button
          key={id}
          type="button"
          className={`editor-toolbar-btn${
            Icon ? " editor-toolbar-btn--icon" : " editor-toolbar-btn--text"
          }${activeClass(isActive(id))}`}
          title={title}
          aria-label={title}
          disabled={isDisabled(id)}
          aria-pressed={isActive(id) || undefined}
          onMouseDown={(event) => runAction(event, id)}
        >
          {Icon ? <Icon className="editor-toolbar-icon" /> : label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Markdown formatting">
      {renderGroup(historyButtons, "History")}

      <div className="editor-toolbar-divider" aria-hidden />

      <select
        className="editor-toolbar-select"
        value={headingLevel}
        disabled={!hasEditor}
        aria-label="Heading level"
        title="Heading level"
        onChange={(event) => runFormat(event.target.value as HeadingLevelValue)}
      >
        {HEADING_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {renderGroup(inlineButtons, "Inline styles")}

      <div className="editor-toolbar-divider" aria-hidden />

      {renderGroup(alignButtons, "Alignment")}

      <div className="editor-toolbar-divider" aria-hidden />

      {renderGroup(listButtons, "Lists")}

      <div className="editor-toolbar-divider" aria-hidden />

      {renderGroup(insertButtons, "Insert blocks")}

      <div className="editor-toolbar-divider" aria-hidden />

      {renderGroup(utilityButtons, "Utilities")}
    </div>
  );
}
