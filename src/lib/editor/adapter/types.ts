import type { FormatActionId, FormatContext } from "../formatActions";

export interface EditorAdapter {
  getContent(): string;
  setContent(content: string): void;
  focus(): void;
  execFormat(actionId: FormatActionId, context?: FormatContext): boolean;
  destroy(): void;
}
