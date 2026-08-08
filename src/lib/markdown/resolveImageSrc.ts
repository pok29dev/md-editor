import { convertFileSrc, isTauri } from "@tauri-apps/api/core";

const REMOTE_SRC_RE = /^(?:https?:|data:|blob:|mailto:|tel:)/i;
const ASSET_SRC_RE = /^(?:asset:|https?:\/\/asset\.localhost)/i;

function dirname(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const index = normalized.lastIndexOf("/");
  if (index <= 0) return normalized;
  return normalized.slice(0, index);
}

function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join("/").replace(/\/+/g, "/");
}

function isAbsolutePath(path: string): boolean {
  if (path.startsWith("/")) return true;
  return /^[a-zA-Z]:[\\/]/.test(path);
}

function normalizePathSeparators(path: string): string {
  return path.replace(/\\/g, "/");
}

export function resolveMarkdownImageAbsolutePath(
  src: string,
  documentPath: string | null,
  rootFolder: string | null,
): string | null {
  const trimmed = src.trim();
  if (!trimmed || REMOTE_SRC_RE.test(trimmed) || ASSET_SRC_RE.test(trimmed)) {
    return null;
  }

  if (isAbsolutePath(trimmed)) {
    return normalizePathSeparators(trimmed);
  }

  if (documentPath) {
    return joinPath(dirname(documentPath), trimmed);
  }

  if (rootFolder) {
    return joinPath(rootFolder, trimmed);
  }

  return null;
}

export function resolveMarkdownImageSrc(
  src: string,
  documentPath: string | null,
  rootFolder: string | null,
): string {
  const absolute = resolveMarkdownImageAbsolutePath(
    src,
    documentPath,
    rootFolder,
  );
  if (!absolute) return src.trim();
  if (!isTauri()) return src.trim();
  return convertFileSrc(absolute);
}
