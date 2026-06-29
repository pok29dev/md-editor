import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";
import {
  escapeRegExp,
  findNextTextMatch,
  findTextMatches,
  getCurrentMatchIndex,
  replaceAllTextMatches,
} from "./findReplace";

function createTextEditor(content: string): Editor {
  return new Editor({
    extensions: [StarterKit],
    content: `<p>${content}</p>`,
  });
}

describe("findReplace", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegExp("a.b(c)")).toBe("a\\.b\\(c\\)");
  });

  it("finds multiple matches case-insensitively", () => {
    const editor = createTextEditor("Hello hello HELLO");
    const matches = findTextMatches(editor, "hello");
    expect(matches).toHaveLength(3);
    editor.destroy();
  });

  it("finds next match from cursor", () => {
    const editor = createTextEditor("foo bar foo");
    editor.commands.setTextSelection(5);
    const match = findNextTextMatch(editor, "foo");
    expect(match?.from).toBeGreaterThanOrEqual(5);
    editor.destroy();
  });

  it("reports 1-based current match index", () => {
    const matches = [
      { from: 0, to: 3 },
      { from: 10, to: 13 },
    ];
    expect(getCurrentMatchIndex(matches, 0)).toBe(1);
    expect(getCurrentMatchIndex(matches, 11)).toBe(2);
  });

  it("replaces all matches", () => {
    const editor = createTextEditor("cat cat dog");
    const count = replaceAllTextMatches(editor, "cat", "bird");
    expect(count).toBe(2);
    expect(editor.getText()).toBe("bird bird dog");
    editor.destroy();
  });
});
