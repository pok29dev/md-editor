import PreviewWorker from "./previewWorker?worker";
import type { RawRenderResult } from "./renderCore";
import type { SegmentedParseResult } from "./segmented";
import {
  isSegmentedPreviewSafe,
  splitMarkdownBlocks,
} from "./segmented";
import type { WorkerRenderResponse } from "./previewWorker";

export const PREVIEW_WORKER_THRESHOLD = 50_000;
export const PREVIEW_SEGMENT_MIN_BLOCKS = 8;
export const PREVIEW_WORKER_TIMEOUT = 12_000;
export const LARGE_DOCUMENT_THRESHOLD = 15_000;
export const HUGE_DOCUMENT_THRESHOLD = 100_000;

let worker: Worker | null = null;
let workerUnavailable = false;
let workerFailureCount = 0;
let requestCounter = 0;

const pendingRequests = new Map<
  number,
  {
    resolve: (value: RawRenderResult | SegmentedParseResult) => void;
    reject: (reason: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  }
>();

function getWorker(): Worker | null {
  if (workerUnavailable || typeof Worker === "undefined") return null;
  if (worker) return worker;

  try {
    worker = new PreviewWorker();
    worker.onmessage = (event: MessageEvent<WorkerRenderResponse>) => {
      const data = event.data;
      const pending = pendingRequests.get(data.requestId);
      if (!pending) return;

      clearTimeout(pending.timeoutId);
      pendingRequests.delete(data.requestId);

      if (data.type === "result") {
        workerFailureCount = 0;
        pending.resolve(data.result);
      } else {
        recordWorkerFailure();
        pending.reject(new Error(data.error || "Preview worker render failed"));
      }
    };
    worker.onerror = (event) => {
      markWorkerUnavailable(event.message || "Preview worker failed");
    };
  } catch {
    workerUnavailable = true;
    return null;
  }

  return worker;
}

function markWorkerUnavailable(message: string): void {
  workerFailureCount += 1;
  if (workerFailureCount >= 2) workerUnavailable = true;

  if (worker) {
    try {
      worker.terminate();
    } catch {
      // ignore
    }
    worker = null;
  }

  pendingRequests.forEach((pending) => {
    clearTimeout(pending.timeoutId);
    pending.reject(new Error(message));
  });
  pendingRequests.clear();
}

function recordWorkerFailure(): void {
  workerFailureCount += 1;
  if (workerFailureCount < 2) return;
  workerUnavailable = true;
  if (worker) {
    try {
      worker.terminate();
    } catch {
      // ignore
    }
    worker = null;
  }
}

export function shouldUsePreviewWorker(content: string): boolean {
  if (workerUnavailable) return false;
  if (content.length < PREVIEW_WORKER_THRESHOLD) return false;
  if (!isSegmentedPreviewSafe(content)) return false;
  return splitMarkdownBlocks(content).length >= PREVIEW_SEGMENT_MIN_BLOCKS;
}

export function requestPreviewWorkerRender(
  content: string,
): Promise<RawRenderResult | SegmentedParseResult> {
  const instance = getWorker();
  if (!instance) {
    return Promise.reject(new Error("Preview worker unavailable"));
  }

  const requestId = ++requestCounter;
  const mode = shouldUsePreviewWorker(content) ? "segmented" : "full";

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      recordWorkerFailure();
      reject(new Error("Preview worker timed out"));
    }, PREVIEW_WORKER_TIMEOUT);

    pendingRequests.set(requestId, { resolve, reject, timeoutId });

    instance.postMessage({
      requestId,
      content,
      mode,
      minimumBlocks: PREVIEW_SEGMENT_MIN_BLOCKS,
    });
  });
}

export function deferPreviewWork(
  callback: () => void,
  contentLength: number,
): () => void {
  let cancelled = false;
  let rafId = 0;
  let idleId = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  rafId = requestAnimationFrame(() => {
    rafId = 0;
    if (cancelled) return;

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        () => {
          idleId = 0;
          if (!cancelled) callback();
        },
        {
          timeout: contentLength >= HUGE_DOCUMENT_THRESHOLD ? 700 : 350,
        },
      );
    } else {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (!cancelled) callback();
      }, 0);
    }
  });

  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (idleId && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(idleId);
    }
    if (timeoutId) clearTimeout(timeoutId);
  };
}

export function getPreviewRenderDelay(contentLength: number): number {
  if (contentLength >= HUGE_DOCUMENT_THRESHOLD) return 240;
  if (contentLength >= LARGE_DOCUMENT_THRESHOLD) return 160;
  return 100;
}
