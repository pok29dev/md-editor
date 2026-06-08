# 07 — API Reference

## 7.1 Tauri IPC Commands

เรียกผ่าน `invoke()` จาก `@tauri-apps/api/core`

### File

| Command | Parameters | Returns |
|---------|------------|---------|
| `scan_folder` | `path: string` | `FolderTree` |
| `read_file` | `path: string` | `FileContent` |
| `write_file` | `path: string, content: string` | `void` |

### Preferences

| Command | Parameters | Returns |
|---------|------------|---------|
| `get_preferences` | — | `AppPreferences` |
| `save_preferences` | `prefs: AppPreferences` | `void` |
| `add_recent_folder` | `path: string` | `AppPreferences` |

## 7.2 Frontend Tauri Wrappers

**ไฟล์:** `lib/tauri/commands.ts`

| Function | คำอธิบาย |
|----------|----------|
| `scanFolder(path)` | Wrapper `scan_folder` |
| `readFile(path)` | Wrapper `read_file` |
| `writeFile(path, content)` | Wrapper `write_file` |
| `getPreferences()` | Wrapper `get_preferences` |
| `savePreferences(prefs)` | Wrapper `save_preferences` |
| `addRecentFolder(path)` | Wrapper `add_recent_folder` |
| `pickFolder()` | Native open directory dialog |
| `pickOpenMarkdown()` | Open `.md` file dialog |
| `pickSaveMarkdown(defaultPath?)` | Save markdown dialog |
| `pickSaveHtml(defaultPath?)` | Save HTML dialog |

## 7.3 Markdown API

### `renderMarkdown(content: string): RenderResult`

**ไฟล์:** `lib/markdown/renderer.ts`

```typescript
interface RenderResult {
  html: string;           // <div class="markdown-body">...</div>
  hasMermaid: boolean;
  hasMath: boolean;
  references: Map<number, ReferenceDefinition>;
  segmented: boolean;
}
```

### `renderMarkdownCore(content: string): RawRenderResult`

**ไฟล์:** `lib/markdown/renderCore.ts` — ไม่ sanitize, ใช้ใน worker

### `buildStandaloneHtml(markdown, title?): string`

**ไฟล์:** `lib/markdown/exportHtml.ts`

### Preview Worker

| Function | ไฟล์ | คำอธิบาย |
|----------|------|----------|
| `shouldUsePreviewWorker(content)` | `previewWorkerClient.ts` | ตรวจว่าควรใช้ worker |
| `requestPreviewWorkerRender(content)` | `previewWorkerClient.ts` | Promise worker result |
| `deferPreviewWork(callback, length)` | `previewWorkerClient.ts` | Idle scheduling |
| `getPreviewRenderDelay(length)` | `previewWorkerClient.ts` | Debounce ms |

### DOM Patch

| Function | ไฟล์ | คำอธิบาย |
|----------|------|----------|
| `patchPreviewDom(container, html, options)` | `previewPatch.ts` | Incremental update |
| `buildSegmentedPreviewHtml(blocks, cache)` | `previewPatch.ts` | Wrap segmented blocks |
| `getPreviewSkeletonHtml()` | `previewPatch.ts` | Skeleton HTML string |
| `captureScrollElement(el)` | `previewPatch.ts` | Snapshot scroll |
| `restoreScrollElement(el, snapshot)` | `previewPatch.ts` | Restore scroll |

### Post-process

| Function | ไฟล์ | คำอธิบาย |
|----------|------|----------|
| `enhanceGitHubAlerts(container)` | `alerts.ts` | Transform blockquotes |
| `applyReferencePreviewLinks(container, defs)` | `references.ts` | Link `[1]` refs |
| `renderMermaid(container, isDark)` | `mermaid.ts` | Async diagram render |
| `renderMathJax(container)` | `mathjax.ts` | Async LaTeX typeset |
| `forceMermaidTheme(isDark)` | `mermaid.ts` | Force theme re-init |

## 7.4 Editor API

| Function | ไฟล์ | คำอธิบาย |
|----------|------|----------|
| `buildEditorExtensions(isDark)` | `lib/editor/extensions.ts` | CodeMirror extension array |
| `createEditorTheme(isDark)` | `lib/editor/theme.ts` | EditorView.theme config |
| `getEditorContent(view)` | `lib/editor/getEditorContent.ts` | อ่าน content จาก CM |

## 7.5 Store Actions (appStore)

| Action | Signature | คำอธิบาย |
|--------|-----------|----------|
| `setTheme` | `(theme) => void` | Set theme preference |
| `setViewMode` | `(mode) => void` | Active tab view mode |
| `toggleSidebar` | `() => void` | Toggle collapse |
| `setSyncScroll` | `(enabled) => void` | Toggle sync scroll |
| `openFileInTab` | `(path, content, title?) => void` | Open/switch tab |
| `updateTabContent` | `(tabId, content) => void` | Update + dirty |
| `markTabSaved` | `(tabId) => void` | Clear dirty |
| `closeTab` | `(tabId) => void` | Remove tab |
| `setFileTree` | `(nodes) => void` | Update tree |
| `toggleFolder` | `(path) => void` | Expand/collapse |

## 7.6 Performance Constants

```typescript
// previewWorkerClient.ts
PREVIEW_WORKER_THRESHOLD = 50_000
PREVIEW_SEGMENT_MIN_BLOCKS = 8
PREVIEW_WORKER_TIMEOUT = 12_000
LARGE_DOCUMENT_THRESHOLD = 15_000
HUGE_DOCUMENT_THRESHOLD = 100_000

// previewPatch.ts
BLOCK_CACHE_LIMIT = 1_200
DOM_PATCH_NODE_LIMIT = 6_000
```

## 7.7 Type Definitions

**ไฟล์:** `src/types/files.ts`

```typescript
interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
}

interface FolderTree {
  root: string;
  nodes: TreeNode[];
}

interface FileContent {
  content: string;
  encoding: string;
  modifiedAt: number;
}

interface AppPreferences {
  theme: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  syncScroll: boolean;
  defaultViewMode: string;
  restoreLastFolderOnStartup: boolean;
  editorFontSize: number;
  editorTabSize: number;
  editorLineNumbers: boolean;
  editorLineWrap: boolean;
  exportPdfTheme: string;
  exportPdfPageSize: string;
  lastOpenFolder?: string;
  recentFolders: string[];
}
```

## 7.8 Version

```typescript
// src/version.ts
export const APP_VERSION = "2026.06.08-1";
```

Format: `yyyy.mm.dd-build`
