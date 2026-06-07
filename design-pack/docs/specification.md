# MD Editor — Product Specification

**Version:** 0.1 (MVP)  
**Last updated:** 2026-06-06  
**Status:** Draft

---

## 1. Overview

### 1.1 ชื่อโปรเจกต์

**MD Editor** — Desktop application สำหรับ browse, view และ edit ไฟล์ Markdown

### 1.2 วัตถุประสงค์

สร้าง desktop app ที่ใช้งานง่าย เน้นการทำงานกับไฟล์ `.md` ในเครื่อง local โดยมี layout คล้าย **CodeRunner**:

- Sidebar ด้านซ้ายสำหรับ browse โฟลเดอร์และไฟล์
- พื้นที่หลักสำหรับ edit + live preview Markdown

### 1.3 อ้างอิง

- UI/UX pattern: CodeRunner (file tree sidebar + editor workspace)
- Markdown rendering: อ้างอิงจาก [Markdown-Viewer wiki](/Users/mrpokx5/development/Markdown-Viewer/wiki)
- Runtime: **Tauri v2** (cross-platform desktop)

### 1.4 ขอบเขต MVP (Basic)

รวมเฉพาะ feature ที่จำเป็นสำหรับการใช้งานประจำวัน  
**ไม่รวม** ใน MVP: GitHub import, Share via URL, mobile layout, i18n หลายภาษา, emoji picker, WYSIWYG/rich-text editing

---

## 2. Target Users

| Persona | ความต้องการ |
|---------|-------------|
| Developer / Technical writer | แก้ไข README, docs, notes ในโปรเจกต์ |
| Content creator | เขียน blog draft เป็น Markdown |
| Student | จดโน้ตและดู preview แบบ GitHub style |

---

## 3. Platform & Technology

### 3.1 Platform

| Platform | Support |
|----------|---------|
| macOS (Apple Silicon + Intel) | ✅ |
| Windows (x64) | ✅ |
| Linux (x64) | ✅ |

### 3.2 Technology Stack

| Layer | Technology | เหตุผล |
|-------|------------|--------|
| Desktop shell | **Tauri v2** | Binary เล็ก, native file access, multi-platform |
| Backend | **Rust** | File I/O, dialogs, state persistence |
| Frontend | **React + TypeScript + Vite** | Ecosystem ดี, เหมาะกับ Tauri |
| Styling | **Tailwind CSS** หรือ CSS variables | Theme switching แบบ Markdown-Viewer |
| Markdown parser | **marked.js** | GFM support, ใช้ใน Markdown-Viewer |
| Syntax highlight | **highlight.js** | 190+ languages |
| Preview style | **github-markdown-css** | Output คล้าย GitHub |
| Sanitization | **DOMPurify** | ป้องกัน XSS |
| Math | **MathJax 3** | LaTeX inline/block |
| Diagrams | **Mermaid** | Flowchart, sequence, etc. |
| YAML frontmatter | **js-yaml** | Parse metadata block |
| Code editor | **CodeMirror 6** หรือ **Monaco Editor** | Line numbers, find/replace |

### 3.3 หลักการออกแบบ

- **Local-first**: ประมวลผลทั้งหมดในเครื่อง ไม่มี server
- **No tracking**: ไม่มี analytics
- **Offline-capable**: bundle libraries ในแอป ไม่พึ่ง CDN

---

## 4. UI Layout (CodeRunner-inspired)

```
┌─────────────────────────────────────────────────────────────────┐
│ Title Bar / App Menu                                            │
│ [Open Folder] [Save] [Save As] │ View: Split│Edit│Preview │ 🌙 │
├──────────────┬──────────────────────────────────────────────────┤
│ SIDEBAR      │ TAB BAR: README.md • notes.md • +                │
│ (resizable)  ├────────────────────────┬─────────────────────────┤
│              │ EDITOR                 │ PREVIEW                 │
│ 📁 my-docs   │ (CodeMirror/Monaco)    │ (GitHub-style HTML)     │
│  📄 README   │                        │                         │
│  📁 guides   │                        │                         │
│   📄 intro   │                        │                         │
│  📄 todo.md  │                        │                         │
│              │                        │                         │
│ [collapse]   │ ← drag divider →       │                         │
└──────────────┴────────────────────────┴─────────────────────────┘
│ Status: README.md • 245 words • Saved • UTF-8                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1 Layout Components

| Component | คำอธิบาย |
|-----------|----------|
| **Sidebar (File Tree)** | แสดงโครงสร้างโฟลเดอร์/ไฟล์ `.md` แบบ collapsible tree |
| **Tab Bar** | เปิดหลายไฟล์พร้อมกัน แสดง unsaved indicator (`•`) |
| **Editor Pane** | Text editor พร้อม line numbers |
| **Preview Pane** | Live preview อัปเดตแบบ debounced |
| **Toolbar** | ปุ่มจำเป็น: Open Folder, Save, View mode, Theme |
| **Status Bar** | ชื่อไฟล์, word count, save state, encoding |

### 4.2 Resizable Panes

- Sidebar width: ลากปรับได้ (min 180px, max 400px)
- Editor/Preview divider: ลากปรับได้ (min 20% ต่อ pane)
- Sidebar collapse: ซ่อน/แสดงด้วยปุ่มหรือ shortcut

---

## 5. Functional Requirements

### 5.1 File & Folder Management

| ID | Requirement | Priority |
|----|-------------|----------|
| F-01 | เปิดโฟลเดอร์ผ่าน native dialog (`Open Folder`) | Must |
| F-02 | แสดง file tree ด้านซ้าย กรองเฉพาะ `.md` และ `.markdown` | Must |
| F-03 | คลิกไฟล์ใน tree เพื่อเปิดใน tab | Must |
| F-04 | รองรับ nested folders แบบ collapsible | Must |
| F-05 | Refresh file tree เมื่อมีการเปลี่ยนแปลงไฟล์ภายนอก (optional: auto-watch) | Should |
| F-06 | จำโฟลเดอร์ล่าสุด (recent folders) | Should |
| F-07 | สร้างไฟล์ `.md` ใหม่ในโฟลเดอร์ที่เปิดอยู่ | Could |
| F-08 | ลบ/rename ไฟล์จาก sidebar | Won't (MVP) |

### 5.2 Editor

| ID | Requirement | Priority |
|----|-------------|----------|
| E-01 | แก้ไข plain text Markdown | Must |
| E-02 | แสดง line numbers | Must |
| E-03 | Undo / Redo (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`) | Must |
| E-04 | Tab = insert 2 spaces | Must |
| E-05 | Find & Replace (`Cmd/Ctrl+F`) | Must |
| E-06 | แสดง unsaved changes indicator บน tab | Must |
| E-07 | Warn ก่อนปิด tab/แอป ถ้ามี unsaved changes | Must |

### 5.3 Markdown Preview (ครบถ้วนตาม GFM)

อ้างอิง [Markdown-Reference](/Users/mrpokx5/development/Markdown-Viewer/wiki/Markdown-Reference.md)

| ID | Syntax Support | Priority |
|----|----------------|----------|
| M-01 | Headings H1–H6 | Must |
| M-02 | Paragraphs, line breaks | Must |
| M-03 | Bold, italic, strikethrough | Must |
| M-04 | Blockquotes (nested) | Must |
| M-05 | Ordered / unordered lists | Must |
| M-06 | Task lists (`- [x]`) | Must |
| M-07 | Inline code & fenced code blocks | Must |
| M-08 | Syntax highlighting (language tag) | Must |
| M-09 | Tables (GFM) | Must |
| M-10 | Links (inline, reference, autolink) | Must |
| M-11 | Images (URL path) | Must |
| M-12 | Horizontal rules | Must |
| M-13 | Footnotes | Should |
| M-14 | HTML blocks (sanitized via DOMPurify) | Must |
| M-15 | LaTeX math (inline `$...$`, block `$$...$$`) | Must |
| M-16 | Mermaid diagrams | Must |
| M-17 | Emoji shortcodes (`:rocket:`) | Should |
| M-18 | GitHub Alerts (`> [!NOTE]`) | Should |
| M-19 | YAML frontmatter → metadata table ใน preview | Should |

### 5.4 View Modes

| Mode | คำอธิบาย | Priority |
|------|----------|----------|
| Split | Editor + Preview คู่กัน (default) | Must |
| Editor Only | ซ่อน preview | Must |
| Preview Only | ซ่อน editor | Must |

### 5.5 Live Preview Behavior

| ID | Requirement | Priority |
|----|-------------|----------|
| P-01 | Preview อัปเดตแบบ debounced (~100ms) ขณะพิมพ์ | Must |
| P-02 | Sync scroll ระหว่าง editor ↔ preview (toggle ได้) | Should |
| P-03 | Preview ใช้ GitHub Markdown CSS | Must |
| P-04 | Render ผ่าน Web Worker สำหรับเอกสารใหญ่ (>50KB) | Could |

### 5.6 Save & Export

| ID | Requirement | Priority |
|----|-------------|----------|
| S-01 | Save ไฟล์ (`Cmd/Ctrl+S`) — เขียนกลับไฟล์เดิม | Must |
| S-02 | Save As — เลือก path ใหม่ | Must |
| S-03 | Export เป็น `.md` (raw source) | Should |
| S-04 | Export เป็น `.html` (standalone พร้อม CSS inline) | Could |
| S-05 | Export PDF | Won't (MVP) |

### 5.7 Theme & Preferences

| ID | Requirement | Priority |
|----|-------------|----------|
| T-01 | Dark / Light theme | Must |
| T-02 | Default theme ตาม system preference | Must |
| T-03 | บันทึก preferences ใน local app data | Must |
| T-04 | จำ view mode, sidebar width, sync scroll state | Should |

### 5.8 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + O` | Open Folder |
| `Cmd/Ctrl + S` | Save |
| `Cmd/Ctrl + Shift + S` | Save As |
| `Cmd/Ctrl + W` | Close tab |
| `Cmd/Ctrl + F` | Find & Replace |
| `Cmd/Ctrl + \` | Toggle sidebar |
| `Cmd/Ctrl + 1/2/3` | Split / Editor / Preview mode |
| `Cmd/Ctrl + B` | Bold (wrap selection) |
| `Cmd/Ctrl + I` | Italic (wrap selection) |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | เปิดไฟล์ ≤1MB ได้ลื่นไหล; preview debounce ≤200ms |
| Security | Sanitize HTML output; ไม่ execute script จาก Markdown |
| Accessibility | Keyboard navigation ใน file tree; ARIA labels |
| Binary size | Target < 30MB (Tauri advantage) |
| Startup | Cold start < 3 วินาที |
| Encoding | UTF-8 และ UTF-8-BOM |

---

## 7. Tauri Backend API (Rust Commands)

```rust
// File system
open_folder(path: String) -> Result<FolderTree, Error>
read_file(path: String) -> Result<FileContent, Error>
write_file(path: String, content: String) -> Result<(), Error>
watch_folder(path: String) -> Result<(), Error>  // optional

// App state
get_recent_folders() -> Vec<String>
add_recent_folder(path: String)
get_preferences() -> AppPreferences
save_preferences(prefs: AppPreferences)

// Dialogs (via tauri-plugin-dialog)
// - open folder dialog
// - save as dialog
```

### 7.1 Data Models

```typescript
interface FolderTree {
  root: string;
  nodes: TreeNode[];
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

interface FileContent {
  path: string;
  content: string;
  encoding: 'utf-8' | 'utf-8-bom';
  modified_at: number;
}

interface EditorTab {
  id: string;
  path: string | null;  // null = untitled
  title: string;
  content: string;
  isDirty: boolean;
  viewMode: 'split' | 'editor' | 'preview';
}

interface AppPreferences {
  colorScheme: 'light' | 'dark' | 'system';
  theme: 'apple' | 'ibm' | 'warm';
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  syncScroll: boolean;
  recentFolders: string[];
  lastOpenFolder: string | null;
  // ... editor, export, view mode fields — see lib/tauri/preferences.ts
}
```

---

## 8. Out of Scope (MVP)

| Feature | เหตุผลที่เลื่อนออก |
|---------|------------------|
| GitHub import | ต้องการ network + UI ซับซ้อน |
| Share via URL | เฉพาะ web app |
| PDF export (advanced) | Basic PDF export มีแล้ว; advanced layout ยังไม่ครบ |
| Git integration | เกินขอบเขต basic |
| WYSIWYG / rich-text toolbar | MVP ใช้ Markdown syntax insertion |
| Multi-language UI | MVP ภาษาอังกฤษ/ไทย UI เดียว |
| Plugin system | Phase 2 |
| Collaborative editing | Phase 2 |

---

## 9. Acceptance Criteria

### AC-1: เปิดโฟลเดอร์และ browse ไฟล์

1. กด Open Folder → เลือกโฟลเดอร์ที่มี `.md`
2. Sidebar แสดง tree structure ถูกต้อง
3. คลิกไฟล์ → เปิด tab และแสดงเนื้อหา

### AC-2: Edit และ Preview

1. พิมพ์ `# Hello` ใน editor
2. Preview แสดง `<h1>Hello</h1>` ภายใน 200ms
3. Code block พร้อม language tag มี syntax highlighting

### AC-3: Save

1. แก้ไขไฟล์ → tab แสดง `•` (unsaved)
2. กด `Cmd+S` → บันทึกลงไฟล์เดิม
3. เปิดไฟล์ด้วย editor อื่น → เห็นเนื้อหาที่บันทึก

### AC-4: Markdown ครบถ้วน

1. เอกสารทดสอบมี: table, task list, math, mermaid, alert
2. Preview render ถูกต้องทุก element
3. HTML อันตรายถูก strip โดย DOMPurify

### AC-5: Cross-platform build

1. `npm run tauri build` สำเร็จบน macOS
2. Binary รันได้โดยไม่ต้องติดตั้งเพิ่ม (นอกจาก OS requirement ของ Tauri)

---

## 10. Project Structure (เป้าหมาย)

```
md-editor/
├── docs/
│   ├── specification.md
│   └── plan.md
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   └── src/
│       ├── main.rs
│       ├── lib.rs
│       ├── commands/
│       │   ├── file.rs
│       │   └── preferences.rs
│       └── models/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── editor/
│   │   │   ├── MarkdownEditor.tsx
│   │   │   └── FindReplace.tsx
│   │   └── preview/
│   │       ├── MarkdownPreview.tsx
│   │       └── PreviewWorker.ts
│   ├── hooks/
│   │   ├── useFileTree.ts
│   │   ├── useTabs.ts
│   │   └── usePreview.ts
│   ├── lib/
│   │   ├── markdown/
│   │   │   ├── renderer.ts
│   │   │   └── sanitize.ts
│   │   └── tauri/
│   │       └── commands.ts
│   ├── stores/
│   │   └── appStore.ts
│   └── styles/
│       ├── globals.css
│       └── themes.css
└── examples/
    └── sample-docs/
        ├── README.md
        └── markdown-features-test.md
```

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Monaco bundle ใหญ่ | Binary โต | ใช้ CodeMirror 6 แทน |
| Mermaid/MathJax ช้า | Preview lag | Lazy load + Web Worker |
| File watcher race | Data loss | Debounce save; warn on external change |
| Tauri v2 API เปลี่ยน | Breaking | Pin version; อ่าน migration guide |
