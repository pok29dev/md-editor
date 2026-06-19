# MD Editor — Development Plan

**Version:** 0.1  
**Last updated:** 2026-06-06  
**Estimated duration:** 4–6 สัปดาห์ (part-time)

---

## 1. Goals

สร้าง MVP ของ MD Editor ตาม [specification.md](./specification.md):

- Desktop app ด้วย Tauri v2
- File tree sidebar + tabbed editor + live preview
- รองรับ Markdown format ครบถ้วน (GFM + Math + Mermaid)

---

## 2. Development Phases

### Phase 0: Project Setup (วัน 1–2)

**เป้าหมาย:** Scaffold โปรเจกต์ Tauri v2 + React + TypeScript

| Task | Output |
|------|--------|
| สร้างโปรเจกต์ด้วย `npm create tauri-app@latest` | โครงสร้างพื้นฐาน |
| ตั้งค่า React + Vite + TypeScript | Frontend build ทำงาน |
| ตั้งค่า Tailwind CSS + CSS variables สำหรับ theme | Theme foundation |
| ตั้งค่า `tauri.conf.json` (window size, title, permissions) | App config |
| เพิ่ม plugins: `tauri-plugin-dialog`, `tauri-plugin-fs` | Native dialogs |
| สร้าง `README.md` พื้นฐาน | Documentation |

**Deliverable:** แอปเปิดหน้าต่างว่างได้บน macOS

```bash
npm create tauri-app@latest md-editor -- --template react-ts
cd md-editor
npm install
npm run tauri dev
```

---

### Phase 1: App Shell & Layout (วัน 3–5)

**เป้าหมาย:** UI layout คล้าย CodeRunner

| Task | Component | Priority |
|------|-----------|----------|
| สร้าง `AppShell` 3-column layout | `AppShell.tsx` | P0 |
| Sidebar placeholder + collapse | `Sidebar.tsx` | P0 |
| Tab bar พร้อม close/new tab | `TabBar.tsx` | P0 |
| Toolbar: placeholder buttons | `Toolbar.tsx` | P0 |
| Status bar | `StatusBar.tsx` | P1 |
| Resizable panes (sidebar, editor/preview) | `react-resizable-panels` | P1 |
| Dark/Light theme toggle | `themes.css` | P1 |

**Deliverable:** Layout สมบูรณ์ ลาก resize ได้ สลับ theme ได้

```
┌─ Sidebar ─┬─ Tabs ─────────────────┐
│  (empty)  ├─ Editor ─┬─ Preview ──┤
│           │  (empty) │  (empty)   │
└───────────┴──────────┴────────────┘
```

---

### Phase 2: File System Backend (วัน 6–8)

**เป้าหมาย:** Rust commands สำหรับ file I/O

| Task | File | Priority |
|------|------|----------|
| `open_folder` — scan `.md` files recursively | `src-tauri/src/commands/file.rs` | P0 |
| `read_file` — UTF-8/UTF-8-BOM | `file.rs` | P0 |
| `write_file` — atomic write | `file.rs` | P0 |
| Open Folder dialog integration | Tauri dialog plugin | P0 |
| `get/save_preferences` | `preferences.rs` | P1 |
| Recent folders list | `preferences.rs` | P1 |

**Rust tree builder logic:**

```rust
fn build_tree(dir: &Path, root: &Path) -> Vec<TreeNode> {
    // Read dir entries
    // Filter: .md, .markdown for files; all folders
    // Sort: folders first, then files (alphabetical)
    // Recurse into folders
}
```

**Deliverable:** กด Open Folder → sidebar แสดง file tree จริง

---

### Phase 3: File Tree UI (วัน 9–10)

**เป้าหมาย:** Interactive sidebar

| Task | Priority |
|------|----------|
| Render recursive tree จาก `FolderTree` | P0 |
| Folder expand/collapse | P0 |
| คลิกไฟล์ → emit event เปิด tab | P0 |
| Highlight ไฟล์ที่ active | P0 |
| Sidebar collapse button | P1 |
| Refresh tree button | P1 |

**Deliverable:** คลิกไฟล์ใน tree → โหลดเนื้อหา (ยังไม่มี editor จริง)

---

### Phase 4: Editor Integration (วัน 11–14)

**เป้าหมาย:** Code editor พร้อม tab management

| Task | Priority |
|------|----------|
| ติดตั้ง CodeMirror 6 + markdown language | P0 |
| `MarkdownEditor` component | P0 |
| Tab state management (`useTabs` hook / Zustand) | P0 |
| เปิดไฟล์ → สร้าง tab + โหลด content | P0 |
| Unsaved indicator (`•`) | P0 |
| Close tab + unsaved warning | P0 |
| Undo/Redo | P0 |
| Line numbers | P0 |
| Find & Replace modal | P1 |

**Dependencies:**

```bash
npm install @codemirror/lang-markdown @codemirror/view @codemirror/state
npm install zustand
```

**Deliverable:** แก้ไข Markdown ใน editor ได้ หลาย tab

---

### Phase 5: Markdown Preview Engine (วัน 15–18)

**เป้าหมาย:** Live preview ครบถ้วนตาม spec

| Task | Priority |
|------|----------|
| ติดตั้ง marked, highlight.js, DOMPurify | P0 |
| `renderer.ts` — configure marked + GFM | P0 |
| Syntax highlighting ใน code blocks | P0 |
| `MarkdownPreview` component + github-markdown-css | P0 |
| Debounced render on editor change | P0 |
| MathJax integration (lazy load) | P1 |
| Mermaid integration (lazy load) | P1 |
| YAML frontmatter parsing | P1 |
| GitHub Alerts rendering | P1 |
| Emoji shortcodes | P2 |
| Web Worker สำหรับเอกสารใหญ่ | P2 |

**Dependencies:**

```bash
npm install marked highlight.js dompurify js-yaml
npm install @types/marked  # dev
```

**Preview pipeline:**

```
Editor content
  → debounce (100ms)
  → parse frontmatter (js-yaml)
  → marked.parse() with GFM
  → highlight.js on code blocks
  → DOMPurify.sanitize()
  → render Mermaid blocks (async)
  → render MathJax (async)
  → inject into preview DOM
```

**Deliverable:** พิมพ์ Markdown → preview อัปเดต real-time รองรับ GFM + math + mermaid

---

### Phase 6: View Modes & Sync Scroll (วัน 19–20)

| Task | Priority |
|------|----------|
| Split / Editor Only / Preview Only toggle | P0 |
| Persist view mode per tab | P1 |
| Sync scroll editor ↔ preview | P1 |
| Sync scroll toggle ใน toolbar | P1 |

**Deliverable:** สลับ view mode ได้ sync scroll ทำงาน

---

### Phase 7: Save & File Operations (วัน 21–23)

| Task | Priority |
|------|----------|
| Save (`Cmd+S`) → `write_file` | P0 |
| Save As dialog | P0 |
| Unsaved warning on close tab/app | P0 |
| Export as `.md` | P1 |
| Export as `.html` (inline CSS) | P2 |
| Detect external file change → prompt reload | P2 |

**Tauri event:**

```rust
// on app exit
if has_unsaved_tabs {
    // show native dialog: Save / Don't Save / Cancel
}
```

**Deliverable:** Save/Save As ทำงานครบ

---

### Phase 8: Polish & Preferences (วัน 24–26)

| Task | Priority |
|------|----------|
| Persist theme, sidebar width, recent folders | P1 |
| Keyboard shortcuts ครบตาม spec | P1 |
| Status bar: word count, file name, save state | P1 |
| App icon | P1 |
| Basic error handling + toast notifications | P1 |
| สร้าง `examples/sample-docs/` สำหรับทดสอบ | P1 |

**Deliverable:** Preferences ถูก restore เมื่อเปิดแอปใหม่

---

### Phase 9: Testing & Build (วัน 27–30)

| Task | Priority |
|------|----------|
| ทดสอบ acceptance criteria ทั้ง 5 ข้อ | P0 |
| ทดสอบ `markdown-features-test.md` ครบทุก syntax | P0 |
| Build macOS `.dmg` / `.app` | P0 |
| Build Windows `.msi` (ถ้ามี environment) | P1 |
| Build Linux `.deb` / `.AppImage` | P1 |
| Fix platform-specific issues | P1 |

**Test document ตัวอย่าง:** `examples/sample-docs/markdown-features-test.md`

- ครอบคลุมทุก syntax ใน Markdown-Reference
- ใช้เป็น regression test ทุกครั้งที่แก้ preview engine

**Deliverable:** Release build v0.1.0

---

## 3. Milestone Summary

| Milestone | Phase | สิ่งที่ได้ | เป้า |
|-----------|-------|-----------|------|
| M0: Scaffold | 0 | Tauri app รันได้ | วัน 2 |
| M1: Layout | 1 | UI shell สมบูรณ์ | วัน 5 |
| M2: File Tree | 2–3 | Browse + เปิดไฟล์ | วัน 10 |
| M3: Editor | 4 | แก้ไข + tabs | วัน 14 |
| M4: Preview | 5 | Live preview ครบ | วัน 18 |
| M5: Complete | 6–8 | Save, theme, shortcuts | วัน 26 |
| M6: Release | 9 | v0.1.0 build | วัน 30 |

---

## 4. Technical Decisions

| Decision | Choice | Alternative | เหตุผล |
|----------|--------|-------------|--------|
| Editor | CodeMirror 6 | Monaco | Bundle เล็กกว่า เหมาะ Tauri |
| State | Zustand | Redux | เบา, เหมาะ MVP |
| Resizable | react-resizable-panels | custom | ลดเวลาพัฒนา |
| Preview | marked.js | remark/rehype | ตรงกับ Markdown-Viewer, proven |
| File watch | Manual refresh (MVP) | notify crate | ลด complexity Phase 1 |
| Persistence | Tauri store plugin | JSON file | Type-safe, cross-platform |

---

## 5. Dependencies

### Frontend (package.json)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@codemirror/lang-markdown": "^6.x",
    "@codemirror/view": "^6.x",
    "@codemirror/state": "^6.x",
    "marked": "^15.x",
    "highlight.js": "^11.x",
    "dompurify": "^3.x",
    "js-yaml": "^4.x",
    "mermaid": "^11.x",
    "zustand": "^5.x",
    "react-resizable-panels": "^2.x"
  }
}
```

### Tauri (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
walkdir = "2"
```

---

## 6. Phase 2 Roadmap (Post-MVP)

| Feature | ลำดับความสำคัญ |
|---------|---------------|
| File watcher (auto-refresh tree) | High |
| Create new file จาก sidebar | High |
| Formatting toolbar (Bold, Italic, Heading) | Medium |
| PDF export | Medium |
| Image drag & drop (copy to assets folder) | Medium |
| Full-text search across project | Low |
| Git status ใน file tree | Low |
| Plugin system | Low |

---

## 7. Getting Started (สำหรับ Developer)

### Prerequisites

- Node.js 20+
- Rust 1.77+
- Platform SDK (Xcode CLI / Visual Studio Build Tools / webkit2gtk)

### Quick Start

```bash
cd md-editor
npm install
npm run tauri dev
```

### Build Release

```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/
```

---

## 8. Definition of Done (MVP)

- [ ] ทุก Acceptance Criteria (AC-1 ถึง AC-5) ผ่าน
- [ ] ไม่มี crash เมื่อเปิดโฟลเดอร์ที่มี 50+ ไฟล์ `.md`
- [ ] Preview render เอกสาร 10KB ภายใน 500ms
- [ ] Save แล้วเปิดด้วย editor อื่นได้เนื้อหาตรงกัน
- [ ] Build สำเร็จบน macOS
- [ ] `README.md` มี installation + usage guide

---

## 9. Post-MVP: Settings (Phase S-1 – S-7)

หลัง MVP หลัก (Phase 0–9) ให้ทำ Settings ตาม **[settings-plan.md](./settings-plan.md)**:

| Phase | เนื้อหา | Effort |
|-------|---------|--------|
| S-1 | Settings modal + persist foundation | 1–2 วัน |
| S-2 | General (theme, sync, default view mode) | 1 วัน |
| S-3 | Files & startup (restore folder, recent) | 1 วัน |
| S-4 | Sidebar width | 1–2 วัน |
| S-5 | Editor (font, tab size, line numbers, wrap) | 2 วัน |
| S-6 | Export PDF options | 1 วัน |
| S-7 | Polish, testing, docs | 1 วัน |

**ลำดับแนะนำ:** S-1 → S-2 → S-3 → S-4 → S-5/S-6 → S-7
