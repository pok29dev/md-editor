import Image from "@tiptap/extension-image";
import { mergeAttributes, type Editor } from "@tiptap/core";
import { resolveMarkdownImageSrc } from "../../markdown/resolveImageSrc";

export interface LocalImageContext {
  documentPath: string | null;
  rootFolder: string | null;
}

let localImageContext: LocalImageContext = {
  documentPath: null,
  rootFolder: null,
};

export function setLocalImageContext(context: LocalImageContext): void {
  localImageContext = context;
}

export function refreshLocalImageNodes(editor: Editor): void {
  const { state } = editor;
  let tr = state.tr;
  let updated = false;

  state.doc.descendants((node, pos) => {
    if (node.type.name !== "image") return;
    tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs });
    updated = true;
  });

  if (!updated) return;
  tr.setMeta("addToHistory", false);
  editor.view.dispatch(tr);
}

export const LocalImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    const mdSrc = HTMLAttributes.src ?? "";
    const displaySrc = resolveMarkdownImageSrc(
      mdSrc,
      localImageContext.documentPath,
      localImageContext.rootFolder,
    );

    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        src: displaySrc,
        "data-md-src": mdSrc,
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
        getAttrs: (node) => {
          const element = node as HTMLImageElement;
          const mdSrc =
            element.getAttribute("data-md-src") ??
            element.getAttribute("src") ??
            "";

          return {
            src: mdSrc,
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
          };
        },
      },
    ];
  },
});
