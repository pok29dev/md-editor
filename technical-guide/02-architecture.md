# 02 — สถาปัตยกรรมระบบ

## 2.1 ภาพรวมชั้น (Layered Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  React Components (AppShell, Editor, Preview, Sidebar)      │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                        │
│  Hooks + Zustand Stores (tabs, file tree, preferences)      │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                             │
│  lib/markdown/*  lib/editor/*  lib/tauri/*                  │
├─────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                     │
│  Tauri IPC  │  Web Worker  │  CodeMirror  │  marked.js      │
├─────────────────────────────────────────────────────────────┤
│                     Rust Backend (Tauri)                     │
│  scan_folder │ read_file │ write_file │ preferences         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     Local Filesystem
```

## 2.2 โครงสร้างโฟลเดอร์

```
md-editor/
├── src/                          # Frontend (React + TS)
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root → AppShell
│   ├── version.ts                # APP_VERSION
│   ├── components/
│   │   ├── layout/               # Shell, sidebar, tabs, panes
│   │   ├── editor/               # MarkdownEditor, FindReplace
│   │   ├── preview/              # MarkdownPreview
│   │   └── icons/                # SVG icons
│   ├── hooks/                    # Business logic hooks
│   ├── stores/                   # Zustand (appStore, editorStore)
│   ├── lib/
│   │   ├── markdown/             # Preview engine
│   │   ├── editor/               # CodeMirror config
│   │   ├── tauri/                # IPC wrappers
│   │   ├── dialogs/              # Unsaved changes
│   │   └── paths.ts              # Cross-platform path utils
│   ├── types/                    # TS interfaces สำหรับ Rust models
│   └── styles/                   # Global CSS
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── lib.rs                # Tauri builder, plugins
│   │   ├── main.rs               # Binary entry
│   │   ├── commands/             # IPC handlers
│   │   └── models/               # Serde structs
│   ├── tauri.conf.json
│   └── capabilities/
├── public/mathjax/               # MathJax offline bundle
├── examples/sample-docs/         # ไฟล์ทดสอบ
├── docs/                         # Product docs
└── technical-guide/              # เอกสารนี้
```

## 2.3 Data Flow หลัก

### เปิดโฟลเดอร์

```
User → pickFolder() [dialog]
     → invoke("scan_folder", path) [Rust]
     → FolderTree { root, nodes[] }
     → appStore.setFileTree()
     → invoke("add_recent_folder") → preferences.json
```

### เปิดไฟล์

```
User คลิกใน FileTree
     → invoke("read_file", path) [Rust, UTF-8/BOM]
     → FileContent { content, encoding, modified_at }
     → appStore.openFileInTab()
     → EditorPane + PreviewPane อ่าน activeTab.content
```

### แก้ไขและ Preview

```
CodeMirror onChange
     → appStore.updateTabContent(tabId, content)
     → usePreview(content) [debounce 100–240ms]
     → renderMarkdown() หรือ Web Worker
     → sanitize → patchPreviewDom
     → enhanceGitHubAlerts, applyReferenceLinks
     → renderMermaid(), renderMathJax() [async]
```

### บันทึกไฟล์

```
Cmd+S → syncActiveTabContentFromEditor() [อ่านจาก CodeMirror โดยตรง]
      → invoke("write_file", path, content) [Rust atomic write]
      → appStore.markTabSaved()
```

## 2.4 IPC Boundary

Frontend เรียก Rust ผ่าน `@tauri-apps/api/core` `invoke()` เท่านั้น — ไม่มี REST API หรือ WebSocket

| Direction | ชนิดข้อมูล | Serialization |
|-----------|-----------|---------------|
| Frontend → Rust | `string`, structs | JSON via Serde |
| Rust → Frontend | `FolderTree`, `FileContent`, `AppPreferences` | JSON |

TypeScript types อยู่ที่ `src/types/files.ts` ต้อง sync กับ `src-tauri/src/models/mod.rs`

## 2.5 State Ownership

| ข้อมูล | Owner | เหตุผล |
|--------|-------|--------|
| Tab content, dirty flag | `appStore` | Single source of truth สำหรับ UI |
| CodeMirror view instance | `editorStore` | จำเป็นเพื่อ Find, sync scroll, save sync |
| File tree structure | `appStore` | มาจาก Rust scan |
| Preferences | Rust JSON + `usePersistPreferences` | Persist ข้าม session |
| Preview HTML | `usePreview` (local ref + DOM) | ไม่เก็บใน global store — imperative DOM |

## 2.6 Concurrency Model

| งาน | Thread |
|-----|--------|
| UI / React | Main thread |
| Markdown parse (เล็ก) | Main thread |
| Markdown parse (≥50KB, safe) | Web Worker (`previewWorker.ts`) |
| Mermaid / MathJax | Main thread (async, post-DOM) |
| File I/O | Rust async (Tauri runtime) |

**Generation token** ใน `usePreview` ยกเลิก async ที่ล้าสมัยเมื่อผู้ใช้พิมพ์ต่อ

## 2.7 Security Model

- Preview HTML ผ่าน **DOMPurify** ก่อน inject
- Mermaid `securityLevel: "strict"`
- Rust `write_file` ใช้ temp file + rename (atomic)
- ไม่ execute user script จาก markdown (ยกเว้น MathJax/Mermaid ที่ควบคุม config)
