import { sanitizeHtml } from "./sanitize";
import { escapeHtmlAttribute } from "./utils";
import type { SegmentedBlockResult } from "./segmented";

const BLOCK_CACHE_LIMIT = 1200;

export interface PatchResult {
  fullReplace: boolean;
  updatedNodes: Node[];
}

export interface PatchOptions {
  hasCommitted?: boolean;
  reuseBlocks?: boolean;
}

function canReusePreviewNode(
  currentNode: Node,
  nextNode: Node,
  options: PatchOptions,
): boolean {
  if (!currentNode || !nextNode || currentNode.nodeType !== nextNode.nodeType) {
    return false;
  }

  if (currentNode.nodeType === Node.TEXT_NODE) {
    if (currentNode.nodeValue !== nextNode.nodeValue) {
      currentNode.nodeValue = nextNode.nodeValue;
    }
    return true;
  }

  if (currentNode.nodeType !== Node.ELEMENT_NODE) {
    return currentNode.nodeValue === nextNode.nodeValue;
  }

  const currentEl = currentNode as HTMLElement;
  const nextEl = nextNode as HTMLElement;
  if ((currentEl.id || nextEl.id) && currentEl.id !== nextEl.id) return false;

  if (
    options.reuseBlocks &&
    currentEl.dataset.previewBlockHash &&
    currentEl.dataset.previewBlockHash === nextEl.dataset.previewBlockHash
  ) {
    return true;
  }

  if (currentEl.outerHTML === nextEl.outerHTML) return true;

  if (
    currentEl.tagName === "DETAILS" &&
    nextEl.tagName === "DETAILS" &&
    currentEl.hasAttribute("open")
  ) {
    nextEl.setAttribute("open", "");
  }

  return false;
}

function patchChildNodes(
  container: HTMLElement,
  nextNodes: Node[],
  options: PatchOptions,
): PatchResult {
  const result: PatchResult = { fullReplace: false, updatedNodes: [] };
  const currentNodeCount = container.childNodes.length;

  if (nextNodes.length > 6000 || currentNodeCount > 6000) {
    container.replaceChildren(...nextNodes);
    result.fullReplace = true;
    result.updatedNodes = [container];
    return result;
  }

  let index = 0;
  while (index < nextNodes.length || index < container.childNodes.length) {
    const currentNode = container.childNodes[index];
    const nextNode = nextNodes[index];

    if (!nextNode) {
      currentNode.remove();
      continue;
    }

    if (!currentNode) {
      container.appendChild(nextNode);
      result.updatedNodes.push(nextNode);
      index += 1;
      continue;
    }

    if (canReusePreviewNode(currentNode, nextNode, options)) {
      index += 1;
      continue;
    }

    result.updatedNodes.push(nextNode);
    currentNode.replaceWith(nextNode);
    index += 1;
  }

  return result;
}

export function patchPreviewDom(
  container: HTMLElement,
  html: string,
  options: PatchOptions = {},
): PatchResult {
  if (!options.hasCommitted) {
    container.innerHTML = html;
    return { fullReplace: true, updatedNodes: [container] };
  }

  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const nextRoot = template.content.firstElementChild as HTMLElement | null;

  if (!nextRoot) {
    container.innerHTML = html;
    return { fullReplace: true, updatedNodes: [container] };
  }

  const currentBody = container.querySelector(".markdown-body");
  if (!currentBody || !(currentBody instanceof HTMLElement)) {
    container.innerHTML = html;
    return { fullReplace: true, updatedNodes: [container] };
  }

  const nextNodes = Array.from(nextRoot.childNodes);
  return patchChildNodes(currentBody, nextNodes, options);
}

export function buildSegmentedPreviewHtml(
  blocks: SegmentedBlockResult[],
  cache: Map<string, string>,
): string {
  const parts = blocks.map((block) => {
    const cacheKey = `${block.hash}:${block.sourceLength}:${block.htmlLength}`;
    let sanitized = cache.get(cacheKey);
    if (sanitized === undefined) {
      sanitized = sanitizeHtml(block.html);
      cache.set(cacheKey, sanitized);
    }

    while (cache.size > BLOCK_CACHE_LIMIT) {
      const firstKey = cache.keys().next().value;
      if (firstKey === undefined) break;
      cache.delete(firstKey);
    }

    return (
      `<section class="preview-render-block" style="content-visibility: auto; contain-intrinsic-size: auto 220px;" ` +
      `data-preview-block-id="${escapeHtmlAttribute(block.id)}" ` +
      `data-preview-block-hash="${escapeHtmlAttribute(cacheKey)}">${sanitized}</section>`
    );
  });

  return `<div class="markdown-body">${parts.join("")}</div>`;
}

export function captureScrollElement(el: HTMLElement | null): {
  top: number;
  left: number;
} | null {
  if (!el) return null;
  return { top: el.scrollTop, left: el.scrollLeft };
}

export function restoreScrollElement(
  el: HTMLElement | null,
  snapshot: { top: number; left: number } | null,
): void {
  if (!el || !snapshot) return;
  requestAnimationFrame(() => {
    const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
    el.scrollTop = Math.min(maxTop, snapshot.top);
    el.scrollLeft = snapshot.left;
  });
}

export function getPreviewSkeletonHtml(): string {
  return `<div class="markdown-body preview-skeleton" aria-hidden="true">
    <div class="skeleton-preview-container">
      <div class="skeleton-placeholder skeleton-title"></div>
      <div class="skeleton-placeholder skeleton-line skeleton-w90"></div>
      <div class="skeleton-placeholder skeleton-line skeleton-w85"></div>
      <div class="skeleton-placeholder skeleton-line skeleton-w60"></div>
      <div class="skeleton-placeholder skeleton-subtitle"></div>
      <div class="skeleton-placeholder skeleton-line skeleton-w88"></div>
      <div class="skeleton-placeholder skeleton-line skeleton-w92"></div>
      <div class="skeleton-placeholder skeleton-line skeleton-w45"></div>
    </div>
  </div>`;
}

export function containsPreviewSkeleton(container: HTMLElement): boolean {
  return container.querySelector(".preview-skeleton") !== null;
}
