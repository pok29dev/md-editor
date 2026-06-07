# 01 — ภาพรวมโปรเจกต

## 1.1 ชื่อและวัตถุประสงค์

**MD Editor** เป็นแอปพลิเคชัน desktop สำหรับ browse, แก้ไข และ preview ไฟล์ Markdown ในเครื่อง local

Use cases หลัก:

- แก้ไข README และเอกสารในโปรเจกต
- เขียน draft บทความ / blog
- จดโน้ตและดู preview แบบ GitHub style

## 1.2 หลักการออกแบบ

| หลักการ | รายละเอียด |
|---------|-----------|
| **Local-first** | อ่าน/เขียนไฟล์จาก filesystem โดยตรง ไม่พึ่ง cloud |
| **Offline-capable** | MathJax bundle ใน `public/mathjax/` ไม่ใช้ CDN |
| **No tracking** | ไม่มี analytics หรือ telemetry |
| **Security** | Sanitize HTML ด้วย DOMPurify ก่อน inject DOM |
| **Performance** | Debounce, Web Worker, incremental DOM patch สำหรับเอกสารใหญ่ |

## 1.3 แพลตฟอร์มที่รองรับ

| Platform | Architecture |
|----------|--------------|
| macOS | Apple Silicon + Intel |
| Windows | x64 |
| Linux | x64 |

## 1.4 Technology Stack

### Desktop & Backend

| Layer | Technology | บทบาท |
|-------|------------|--------|
| Shell | Tauri v2 | Window, IPC, bundling |
| Backend | Rust | File scan/read/write, preferences JSON |
| Dialogs | tauri-plugin-dialog | Open/Save native dialogs |
| FS plugin | tauri-plugin-fs | (registered, ใช้ร่วม ecosystem) |

### Frontend

| Layer | Technology | บทบาท |
|-------|------------|--------|
| UI | React 19 | Component tree |
| Build | Vite 7 | Dev server, HMR, production bundle |
| Language | TypeScript 5.8 | Type safety |
| State | Zustand 5 | Global app/editor state |
| Styling | CSS variables + Tailwind 4 | Theme, layout |
| Layout | react-resizable-panels | Editor/Preview split |

### Editor & Preview

| Layer | Technology | บทบาท |
|-------|------------|--------|
| Editor | CodeMirror 6 | Markdown editing |
| Parser | marked 18 | GFM → HTML |
| Highlight | highlight.js | Code blocks ใน preview |
| Sanitize | DOMPurify | XSS prevention |
| Preview CSS | github-markdown-css | GitHub-style output |
| Math | MathJax 3 | LaTeX (offline) |
| Diagrams | Mermaid 11 | Flowchart, sequence, etc. |
| Frontmatter | js-yaml | YAML metadata block |

## 1.5 อ้างอิงการออกแบบ

- **UI pattern:** CodeRunner-style (sidebar + tabs + editor workspace)
- **Markdown rendering:** อ้างอิงจาก [Markdown-Viewer](https://github.com/) — marked.js pipeline, GitHub alerts, footnotes, segmented worker
- **Product spec:** [docs/specification.md](../docs/specification.md)

## 1.6 ขอบเขต MVP

**รวมแล้ว:**

- Open Folder + file tree (keyboard nav, open-folder button ใน sidebar)
- Multi-tab editing
- Live preview (GFM + extensions)
- Save / Save As / Export HTML / Export PDF
- Settings modal (General, Editor, Files, Export)
- Formatting — expanded toolbar + native menus + shortcuts
- Color scheme (system/light/dark) + app themes (default/blue/warm)
- Lucide icon toolbar, UI redesign (chrome, dialogs, empty states)
- Sync scroll, view modes per tab
- Find & Replace, Link/Reference/Emoji/Symbols dialogs

**ยังไม่รวม (Post-MVP):**

- Git integration
- File watcher อัตโนมัติ
- Sidebar drag-resize แบบ live (ปรับ width จาก Settings)
- Emoji shortcodes (`:rocket:`)

ดูรายละเอียด gaps ใน [08-development.md](./08-development.md)
