import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
  renderMarkdown,
  finalizeWorkerResult,
  type RenderResult,
} from "../lib/markdown/renderer";
import { renderMermaid, forceMermaidTheme } from "../lib/markdown/mermaid";
import { renderMathJax } from "../lib/markdown/mathjax";
import { enhanceGitHubAlerts } from "../lib/markdown/alerts";
import { applyReferencePreviewLinks } from "../lib/markdown/references";
import {
  patchPreviewDom,
  captureScrollElement,
  restoreScrollElement,
  getPreviewSkeletonHtml,
  containsPreviewSkeleton,
} from "../lib/markdown/previewPatch";
import {
  deferPreviewWork,
  getPreviewRenderDelay,
  LARGE_DOCUMENT_THRESHOLD,
  requestPreviewWorkerRender,
  shouldUsePreviewWorker,
} from "../lib/markdown/previewWorkerClient";
import type { SegmentedParseResult } from "../lib/markdown/segmented";
import { useAppStore } from "../stores/appStore";

function isFullRequired(
  result: unknown,
): result is SegmentedParseResult & { mode: "full-required" } {
  return (
    typeof result === "object" &&
    result !== null &&
    "mode" in result &&
    (result as SegmentedParseResult).mode === "full-required"
  );
}

export function usePreview(
  content: string,
  tabId: string | null,
  scrollElRef: RefObject<HTMLElement | null>,
) {
  const resolvedTheme = useAppStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === "dark";

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const deferCancelRef = useRef<(() => void) | null>(null);
  const generationRef = useRef(0);
  const renderResultRef = useRef<RenderResult | null>(null);
  const prevIsDarkRef = useRef(isDark);
  const lastContentRef = useRef("");
  const lastTabIdRef = useRef<string | null>(tabId);
  const hasCommittedRef = useRef(false);
  const segmentCacheRef = useRef(new Map<string, string>());

  const [commitToken, setCommitToken] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    deferCancelRef.current?.();
    deferCancelRef.current = null;

    const unchanged =
      content === lastContentRef.current &&
      tabId === lastTabIdRef.current &&
      hasCommittedRef.current;
    if (unchanged) return;

    const delay = getPreviewRenderDelay(content.length);
    const generation = ++generationRef.current;
    const isLarge = content.length >= LARGE_DOCUMENT_THRESHOLD;
    const isTabSwap = tabId !== lastTabIdRef.current;
    const container = containerRef.current;

    timerRef.current = setTimeout(() => {
      if (generationRef.current !== generation) return;

      const showSkeleton =
        isLarge &&
        container &&
        (!hasCommittedRef.current || isTabSwap || containsPreviewSkeleton(container));

      if (showSkeleton) {
        container.innerHTML = getPreviewSkeletonHtml();
        setIsRefreshing(true);
      } else {
        setIsRefreshing(true);
      }

      const execute = () => {
        if (generationRef.current !== generation) return;

        void (async () => {
          let result: RenderResult;

          if (shouldUsePreviewWorker(content)) {
            try {
              const workerResult = await requestPreviewWorkerRender(content);
              if (generationRef.current !== generation) return;

              if (isFullRequired(workerResult)) {
                result = renderMarkdown(content);
              } else {
                result = finalizeWorkerResult(
                  workerResult,
                  segmentCacheRef.current,
                );
              }
            } catch {
              if (generationRef.current !== generation) return;
              result = renderMarkdown(content);
            }
          } else {
            result = renderMarkdown(content);
          }

          if (generationRef.current !== generation) return;

          renderResultRef.current = result;
          lastContentRef.current = content;
          lastTabIdRef.current = tabId;
          setCommitToken((token) => token + 1);
        })();
      };

      if (isLarge) {
        deferCancelRef.current = deferPreviewWork(execute, content.length);
      } else {
        execute();
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      deferCancelRef.current?.();
      deferCancelRef.current = null;
    };
  }, [content, tabId]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const result = renderResultRef.current;
    if (!container || !result) return;

    const gen = generationRef.current;
    const scrollSnapshot =
      hasCommittedRef.current && !containsPreviewSkeleton(container)
        ? captureScrollElement(scrollElRef.current)
        : null;

    patchPreviewDom(container, result.html, {
      hasCommitted: hasCommittedRef.current,
      reuseBlocks: result.segmented,
    });
    hasCommittedRef.current = true;
    setIsRefreshing(false);

    const body = container.querySelector<HTMLElement>(".markdown-body");
    if (!body) return;

    body.setAttribute("data-color-mode", isDark ? "dark" : "light");
    enhanceGitHubAlerts(body);
    applyReferencePreviewLinks(body, result.references);
    restoreScrollElement(scrollElRef.current, scrollSnapshot);

    void (async () => {
      if (result.hasMermaid) {
        if (prevIsDarkRef.current !== isDark) {
          forceMermaidTheme(isDark);
          prevIsDarkRef.current = isDark;
        }
        await renderMermaid(container, isDark);
      }
      if (generationRef.current !== gen) return;

      if (result.hasMath) {
        await renderMathJax(container);
      }
    })();
  }, [commitToken, isDark, scrollElRef]);

  return { containerRef, isRefreshing };
}
