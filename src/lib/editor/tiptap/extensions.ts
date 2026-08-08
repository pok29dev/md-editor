import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { PreservedMarkdown } from "./preservedBlockExtension";
import { LocalImage } from "./localImageExtension";

import { Markdown } from "tiptap-markdown";

export function buildTiptapExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    LocalImage.configure({ inline: false }),
    Underline,
    Highlight,
    Subscript,
    Superscript,
    PreservedMarkdown,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Placeholder.configure({
      placeholder: "Start writing…",
    }),
    Markdown.configure({
      html: true,
      breaks: true,
      transformPastedText: true,
      bulletListMarker: "-",
    }),
  ];
}
