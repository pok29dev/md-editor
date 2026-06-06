import { renderMarkdownCore, type RawRenderResult } from "./renderCore";
import {
  renderSegmentedMarkdown,
  type SegmentedParseResult,
} from "./segmented";
import { marked } from "marked";

export interface WorkerRenderRequest {
  requestId: number;
  content: string;
  mode: "full" | "segmented";
  minimumBlocks?: number;
}

export interface WorkerRenderSuccess {
  requestId: number;
  type: "result";
  result: RawRenderResult | SegmentedParseResult;
}

export interface WorkerRenderFailure {
  requestId: number;
  type: "error";
  error: string;
}

export type WorkerRenderResponse = WorkerRenderSuccess | WorkerRenderFailure;

self.onmessage = (event: MessageEvent<WorkerRenderRequest>) => {
  const data = event.data;
  if (!data || typeof data.requestId !== "number") return;

  try {
    if (data.mode === "segmented") {
      const result = renderSegmentedMarkdown(
        data.content,
        data.minimumBlocks ?? 8,
        (source) => marked.parse(source, { async: false }) as string,
      );
      const response: WorkerRenderSuccess = {
        requestId: data.requestId,
        type: "result",
        result,
      };
      self.postMessage(response);
      return;
    }

    const result = renderMarkdownCore(data.content);
    const response: WorkerRenderSuccess = {
      requestId: data.requestId,
      type: "result",
      result,
    };
    self.postMessage(response);
  } catch (err) {
    const response: WorkerRenderFailure = {
      requestId: data.requestId,
      type: "error",
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};
