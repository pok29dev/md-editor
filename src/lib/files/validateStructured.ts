import yaml from "js-yaml";
import type { FileKind } from "./fileKind";

export interface ValidationResult {
  valid: boolean;
  message: string | null;
}

export function validateJson(text: string): ValidationResult {
  try {
    JSON.parse(text);
    return { valid: true, message: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, message };
  }
}

export function validateYaml(text: string): ValidationResult {
  if (!text.trim()) {
    return { valid: true, message: null };
  }

  try {
    yaml.load(text);
    return { valid: true, message: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, message };
  }
}

export function validateStructuredContent(
  kind: FileKind,
  text: string,
): ValidationResult {
  if (kind === "json") return validateJson(text);
  if (kind === "yaml") return validateYaml(text);
  return { valid: true, message: null };
}

export function formatJson(text: string): string {
  const parsed = JSON.parse(text);
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

export function formatYaml(text: string): string {
  const parsed = text.trim() ? yaml.load(text) : null;
  return yaml.dump(parsed, { indent: 2, lineWidth: -1 });
}

export function formatStructuredContent(kind: FileKind, text: string): string {
  if (kind === "json") return formatJson(text);
  if (kind === "yaml") return formatYaml(text);
  return text;
}
