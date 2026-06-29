import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import {
  filterSlashCommands,
  getSlashQuery,
  runSlashCommand,
  type SlashCommand,
} from "../../lib/editor/tiptap/slashCommands";
import "../../styles/tiptap-slash.css";

interface TiptapSlashMenuProps {
  editor: Editor;
}

interface SlashMenuState {
  top: number;
  left: number;
  query: string;
}

export function TiptapSlashMenu({ editor }: TiptapSlashMenuProps) {
  const [menu, setMenu] = useState<SlashMenuState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(
    () => (menu ? filterSlashCommands(menu.query) : []),
    [menu],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [menu?.query, commands.length]);

  useEffect(() => {
    const update = () => {
      const slash = getSlashQuery(editor);
      if (!slash) {
        setMenu(null);
        return;
      }

      const coords = editor.view.coordsAtPos(slash.range.to);
      const root = editor.view.dom.closest(".tiptap-editor-root");
      const rootRect = root?.getBoundingClientRect();
      if (!rootRect) {
        setMenu(null);
        return;
      }

      setMenu({
        query: slash.query,
        top: coords.bottom - rootRect.top + (root instanceof HTMLElement ? root.scrollTop : 0) + 6,
        left: Math.max(8, coords.left - rootRect.left),
      });
    };

    update();
    editor.on("transaction", update);
    return () => {
      editor.off("transaction", update);
    };
  }, [editor]);

  useEffect(() => {
    if (!menu) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(null);
        return;
      }

      if (commands.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((index) => (index + 1) % commands.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(
          (index) => (index - 1 + commands.length) % commands.length,
        );
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const command = commands[selectedIndex];
        if (command) {
          runSlashCommand(editor, command);
          setMenu(null);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [commands, editor, menu, selectedIndex]);

  if (!menu || commands.length === 0) return null;

  const runCommand = (command: SlashCommand) => {
    runSlashCommand(editor, command);
    setMenu(null);
  };

  return (
    <div
      ref={menuRef}
      className="tiptap-slash-menu"
      style={{ top: menu.top, left: menu.left }}
      role="listbox"
      aria-label="Slash commands"
    >
      {commands.map((command, index) => (
        <button
          key={command.id}
          type="button"
          className={`tiptap-slash-item${
            index === selectedIndex ? " is-selected" : ""
          }`}
          role="option"
          aria-selected={index === selectedIndex}
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand(command);
          }}
        >
          <span className="tiptap-slash-item__label">{command.label}</span>
          {command.hint ? (
            <span className="tiptap-slash-item__hint">{command.hint}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
