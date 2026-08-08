import { resolveMarkdownImageSrc } from "./resolveImageSrc";

export function applyLocalPreviewImages(
  container: HTMLElement,
  documentPath: string | null,
  rootFolder: string | null,
): void {
  container.querySelectorAll<HTMLImageElement>("img[src]").forEach((img) => {
    const original = img.getAttribute("data-md-src") ?? img.getAttribute("src") ?? "";
    if (!original) return;

    if (!img.hasAttribute("data-md-src")) {
      img.setAttribute("data-md-src", original);
    }

    const resolved = resolveMarkdownImageSrc(
      original,
      documentPath,
      rootFolder,
    );
    if (resolved !== img.getAttribute("src")) {
      img.setAttribute("src", resolved);
    }
  });
}
