# MD Editor — Technical Guide

เอกสารทางเทคนิคสำหรับนักพัฒนาและผู้ดูแลโปรเจกต **MD Editor**

**เวอร์ชันอ้างอิง:** `26.6.11.2` (ดู `src/version.ts`)  
**สถานะ:** MVP Complete + UI Redesign  
**อัปเดตล่าสุด:** 2026-06-07

---

## สารบัญ

| เอกสาร | เนื้อหา |
|--------|---------|
| [01-overview.md](./01-overview.md) | ภาพรวมโปรเจกต, หลักการออกแบบ, tech stack |
| [02-architecture.md](./02-architecture.md) | สถาปัตยกรรมระบบ, data flow, โครงสร้างโฟลเดอร์ |
| [03-frontend.md](./03-frontend.md) | React components, Zustand stores, hooks |
| [04-markdown-engine.md](./04-markdown-engine.md) | Preview pipeline, worker, extensions, performance |
| [05-backend.md](./05-backend.md) | Tauri/Rust commands, models, file I/O |
| [06-ui-ux.md](./06-ui-ux.md) | Layout, theme, view modes, keyboard shortcuts |
| [07-api-reference.md](./07-api-reference.md) | ฟังก์ชันหลัก, IPC, constants |
| [08-development.md](./08-development.md) | Setup, build, การขยายระบบ, known gaps |

---

## เอกสารที่เกี่ยวข้อง

| เอกสาร | ที่อยู่ | วัตถุประสงค์ |
|--------|--------|-------------|
| Product Specification | [docs/specification.md](../docs/specification.md) | ข้อกำหนดผลิตภัณฑ์ |
| Development Plan | [docs/plan.md](../docs/plan.md) | แผนพัฒนา Phase 0–9 |
| Settings Plan | [docs/settings-plan.md](../docs/settings-plan.md) | แผน implement Settings MVP |
| Editor Toolbar Lucide | [docs/editor-toolbar-lucide.md](../docs/editor-toolbar-lucide.md) | Icon mapping อ้างอิง |
| Testing Checklist | [docs/TESTING.md](../docs/TESTING.md) | Acceptance criteria |
| Design Pack | [design-pack/DESIGN-BRIEF.md](../design-pack/DESIGN-BRIEF.md) | UI brief สำหรับ AI design tools |
| Changelog | [CHANGELOG.md](../CHANGELOG.md) | ประวัติการเปลี่ยนแปลง |

---

## สรุปสั้น

MD Editor เป็น **desktop app แบบ local-first** ที่ใช้:

- **Tauri v2 + Rust** — file I/O, preferences, native dialogs
- **React 19 + TypeScript + Vite 7** — UI และ state
- **CodeMirror 6** — text editor
- **marked.js pipeline** — live preview (GFM, Mermaid, MathJax, footnotes, alerts)
- **lucide-react** — icon สำหรับ toolbar ทั้งหมด

การประมวลผลทั้งหมดเกิดขึ้นในเครื่อง ไม่มี server และไม่มี analytics
