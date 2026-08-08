import { describe, expect, it, vi } from "vitest";
import { resolveMarkdownImageAbsolutePath } from "./resolveImageSrc";

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => false,
  convertFileSrc: (path: string) => path,
}));

describe("resolveMarkdownImageAbsolutePath", () => {
  it("returns null for remote URLs", () => {
    expect(
      resolveMarkdownImageAbsolutePath(
        "https://example.com/a.png",
        "/docs/readme.md",
        null,
      ),
    ).toBeNull();
  });

  it("returns absolute paths unchanged", () => {
    expect(
      resolveMarkdownImageAbsolutePath(
        "/Users/me/photo.png",
        "/docs/readme.md",
        null,
      ),
    ).toBe("/Users/me/photo.png");
  });

  it("resolves relative paths from the document directory", () => {
    expect(
      resolveMarkdownImageAbsolutePath(
        "assets/pasted.png",
        "/Users/me/docs/readme.md",
        null,
      ),
    ).toBe("/Users/me/docs/assets/pasted.png");
  });

  it("falls back to root folder when document path is missing", () => {
    expect(
      resolveMarkdownImageAbsolutePath(
        "assets/pasted.png",
        null,
        "/Users/me/workspace",
      ),
    ).toBe("/Users/me/workspace/assets/pasted.png");
  });

  it("returns null when no base path is available", () => {
    expect(
      resolveMarkdownImageAbsolutePath("assets/pasted.png", null, null),
    ).toBeNull();
  });
});
