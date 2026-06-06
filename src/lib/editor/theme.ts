import { EditorView } from "@codemirror/view";

export function createEditorTheme(isDark: boolean, fontSize: number) {
  const gutterFontSize = Math.max(11, fontSize - 2);

  return EditorView.theme(
    {
      "&": {
        height: "100%",
        backgroundColor: "var(--editor-bg)",
        color: "var(--text-primary)",
      },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily:
          '"SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
        fontSize: `${fontSize}px`,
      },
      ".cm-content": {
        caretColor: "var(--accent)",
        padding: "8px 0",
        paddingLeft: "8px",
      },
      ".cm-gutters": {
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-muted)",
        border: "none",
        borderRight: "1px solid var(--border)",
        flexShrink: "0",
      },
      ".cm-lineNumbers": {
        fontSize: `${gutterFontSize}px`,
        minWidth: "2.75em",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 6px 0 5px",
        minWidth: "20px",
        textAlign: "right",
        whiteSpace: "nowrap",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "var(--bg-hover)",
        color: "var(--text-secondary)",
      },
      /* Border indicator only — full background hides drawSelection/native selection */
      ".cm-activeLine": {
        backgroundColor: "transparent",
        borderLeft: "2px solid var(--accent)",
        marginLeft: "-2px",
        paddingLeft: "6px",
      },
      ".cm-line": {
        padding: "0 8px 0 0",
      },
    },
    { dark: isDark },
  );
}
