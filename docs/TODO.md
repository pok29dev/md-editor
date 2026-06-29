# MD Editor — TODO List

**Current version:** `26.6.2001`  
**Status:** MVP Complete + thClaws integration ✅

---

## Phase 0–9 ✅

- [x] Phase 0: Scaffold Tauri v2 + React
- [x] Phase 1: App shell & layout
- [x] Phase 2: File system backend
- [x] Phase 3: File tree UI
- [x] Phase 4: CodeMirror editor
- [x] Phase 5: Markdown preview engine
- [x] Phase 6: Sync scroll + view mode per tab
- [x] Phase 7: Save / Save As / Export HTML
- [x] Phase 8: Preferences persist, offline MathJax, app icon
- [x] Phase 9: Build + testing checklist

---

## Settings MVP ✅

- [x] Phase S-1: Settings shell + persist foundation
- [x] Phase S-2: General (color scheme + app theme)
- [x] Phase S-3: Files & startup
- [x] Phase S-4: Sidebar width
- [x] Phase S-5: Editor
- [x] Phase S-6: Export PDF options
- [x] Phase S-7: Polish & QA

---

## Formatting MVP ✅

- [x] Editor toolbar + native menus + shortcuts
- [x] Link dialog + expanded insert actions
- [x] Lucide icons ทั้ง toolbar

---

## UI Redesign ✅

- [x] Phase 1: Design tokens + status bar dark fix
- [x] Phase 2: Title bar, tab bar, file tree icons
- [x] Phase 3: Editor toolbar, preview padding, empty states
- [x] Phase 4: Dialogs polish, Settings visual refresh
- [x] Phase 5: File tree keyboard nav, Lucide toolbar icons
- [x] Sidebar open-folder button
- [x] design-pack assemble script

---

## JSON/YAML Support ✅

- [x] Phase 1: File type detection + tree + open files
- [x] Phase 2: CodeMirror JSON/YAML editor + syntax colors
- [x] Phase 3: Preview/view mode rules สำหรับ data files
- [x] Phase 4: Validation + format (`⌘⇧F`) + save guard
- [x] Custom syntax color palette (Settings → Editor)
- [x] Spec: `docs/spec-json-yaml.md`

---

## thClaws & AI Structure ✅

- [x] Rust serve manager + thClaws commands (`working_dir` จาก sidebar folder)
- [x] App view `editor | thclaws` แยกจาก document tabs
- [x] ThclawsPane — Run/Stop, iframe, lifecycle (stop เมื่อเปลี่ยน folder / ปิด app)
- [x] Settings → AI Structure (CLI path, detect, test, open config dirs)
- [x] AI Structure Markdown + diff dialog
- [x] Normalize Markdown pipeline
- [x] Native menus — View (layout + app views) / Window (OS standard)
- [x] StatusBar hooks fix (white screen on thClaws switch)

---

## WYSIWYG (Tiptap) — In progress

อ้างอิง: [wysiwyg-plan.md](./wysiwyg-plan.md) · branch `feature/wysiwyg-tiptap`

- [x] Phase 0: Tiptap packages + round-trip foundation (`tiptap-markdown`)
- [x] Phase 1: `EditMode`, flush/save flow, format routing
- [x] Phase 2: WYSIWYG MVP + Source/WYSIWYG toggle (`⌘⌥S`, title bar)
- [x] Phase 3 (partial): table, task list, highlight, frontmatter banner, bubble menu
- [x] Phase 3: preserved blocks (mermaid, math, alerts, footnotes, definition list), sup/sub
- [x] Phase 4: slash commands, paste/drop image, focus/typewriter mode
- [ ] Phase 5: Find/replace in WYSIWYG, round-trip tests, docs

---

## Post-MVP (Optional)

- [ ] CI/CD release workflow
- [ ] Windows / Linux release builds
- [ ] Code-split Mermaid bundle (ลดขนาด)
- [ ] Create new file จาก sidebar
- [ ] Git status ใน file tree
- [ ] Sidebar live drag-resize
- [ ] File watcher อัตโนมัติ
- [ ] Settings toggle ซ่อน/แสดง JSON/YAML ใน tree (Phase 5)
- [ ] JSON Schema validation
- [ ] Regenerate design-pack screenshots
- [ ] Emoji shortcodes (`:rocket:`)
