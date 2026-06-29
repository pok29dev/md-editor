import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { PreservedBlockView } from "../../../components/editor/tiptap/PreservedBlockView";

export const PreservedMarkdown = Node.create({
  name: "preservedMarkdown",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      kind: {
        default: "unknown",
        parseHTML: (element) =>
          element.getAttribute("data-kind") ?? "unknown",
      },
      raw: {
        default: "",
        parseHTML: (element) => {
          const encoded = element.getAttribute("data-raw") ?? "";
          try {
            return decodeURIComponent(encoded);
          } catch {
            return encoded;
          }
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-preserved-md]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const raw = String(HTMLAttributes.raw ?? "");
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-preserved-md": "",
        "data-kind": HTMLAttributes.kind,
        "data-raw": encodeURIComponent(raw),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PreservedBlockView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (text: string) => void; closeBlock: (node: unknown) => void }, node: { attrs: { raw: string } }) {
          state.write(node.attrs.raw);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});
