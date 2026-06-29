import { isTauri } from "@tauri-apps/api/core";
import { writeBinaryFile } from "../../tauri/commands";

const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function dirname(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const index = normalized.lastIndexOf("/");
  if (index <= 0) return normalized;
  return normalized.slice(0, index);
}

function joinPath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/");
}

function extensionForFile(file: File): string {
  const fromMime = IMAGE_MIME_EXTENSIONS[file.type];
  if (fromMime) return fromMime;

  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt === "jpeg") return "jpg";
  if (nameExt && ["png", "jpg", "gif", "webp", "svg"].includes(nameExt)) {
    return nameExt;
  }
  return "png";
}

function buildImageFilename(file: File): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+$/, "")
    .replace("T", "-");
  return `pasted-${stamp}.${extensionForFile(file)}`;
}

export interface ImageInsertTarget {
  absolutePath: string;
  markdownPath: string;
}

export function canInsertImageFromClipboard(
  documentPath: string | null,
  rootFolder: string | null,
): boolean {
  return Boolean(
    resolveImageInsertTarget(documentPath, rootFolder, "pasted.png"),
  );
}

export function resolveImageInsertTarget(
  documentPath: string | null,
  rootFolder: string | null,
  filename: string,
): ImageInsertTarget | null {
  if (documentPath) {
    const baseDir = dirname(documentPath);
    return {
      absolutePath: joinPath(baseDir, "assets", filename),
      markdownPath: `assets/${filename}`,
    };
  }

  if (rootFolder) {
    return {
      absolutePath: joinPath(rootFolder, "assets", filename),
      markdownPath: `assets/${filename}`,
    };
  }

  return null;
}

export async function saveImageFileForInsert(
  file: File,
  documentPath: string | null,
  rootFolder: string | null,
): Promise<ImageInsertTarget | null> {
  if (!isTauri()) return null;

  const filename = buildImageFilename(file);
  const target = resolveImageInsertTarget(documentPath, rootFolder, filename);
  if (!target) return null;

  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeBinaryFile(target.absolutePath, bytes);
  return target;
}

export function readImageFileFromDataTransfer(
  dataTransfer: DataTransfer,
): File | null {
  const files = Array.from(dataTransfer.files).filter((file) =>
    file.type.startsWith("image/"),
  );
  if (files.length > 0) return files[0];

  for (const item of Array.from(dataTransfer.items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }

  return null;
}
