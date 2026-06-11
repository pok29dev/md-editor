# Changelog

รูปแบบ version: `yy.m.d.build` (e.g. `26.6.11.2`)

## [26.6.11.2] — 2026-06-11

### Fixed

- **Preview dark mode** — table, inline code, code blocks (`pre`), และ syntax highlight ไม่แสดงพื้นขาวเมื่อแอปอยู่โหมดมืด (`preview-markdown-dark.css` ผูกกับ `data-color-scheme="dark"`)

## [26.6.11.1] — 2026-06-11

### Added

- **Preview font size** — toolbar `-` / scale / `+` / reset (default 16px = 100%); persist ใน preferences; ไม่กระทบ export
- **Sidebar folder actions** — ปุ่ม expand all / collapse all ใน `SidebarToolbar`
- **`SidebarToolbar`** — แถบเครื่องมือแยกใต้ชื่อโฟลเดอร์ (ใน sidebar content column)

### Changed

- **Version format** — `yy.m.d.build` (e.g. `26.6.11.1`); release tags `v.26.6.11.1`
- **Copyright** — `pok29dev` (About menu, `APP_COPYRIGHT`, Cargo authors)
- **Preview layout** — ความกว้างเนื้อหา 700px (ไม่รวม padding); ฟอนต์ผ่าน `--preview-font-size`
- **Sidebar header** — ชื่อโฟลเดอร์แถวเดียวกับ Tab bar; toolbar ย้ายลง sidebar column
- **Toolbar height** — sidebar / editor / preview ใช้ `--workspace-toolbar-height` (44px)

## [26.6.8.1] — 2026-06-08

### Added

- **Open With (.md)** — ลงทะเบียน file association และเปิดไฟล์จาก OS (double-click / Open With)
- **Settings → Files → Folder tree expansion** — เลือกขยาย tree แบบ one level หรือ all folders

### Fixed

- **Open folder** — ล้าง tree โฟลเดอร์เดิมก่อนโหลดโฟลเดอร์ใหม่
- **Titlebar drag** — ลากหน้าต่างได้บน macOS (`startDragging` + drag zones)
- **Folder toggle** — คลิกยุบ/ขยายโฟลเดอร์ทำงานถูกต้องหลังเปลี่ยน default expansion

## [2026.06.07-2] — 2026-06-07

### Added

- **Markdown help** — Help dialog แสดง `markdown-help.md` ผ่าน preview pipeline (Mermaid, MathJax)
- **Sidebar open folder** — ปุ่ม `FolderOpen` ใน sidebar title bar

### Changed

- **App theme names** — `apple` → `default`, `ibm` → `blue` (migrate preferences อัตโนมัติ)
- Settings theme picker แสดง **Default** / **Blue** / **Warm Editor**

## [2026.06.07-1] — 2026-06-07

### Added

- **UI redesign** — Chrome, workspace, overlays, a11y polish (Phases 1–5)
- **Lucide icons** — title bar, editor toolbar, color scheme toggle, panel controls
- **App themes** — Default / Blue / Warm (`data-app-theme`) แยกจาก color scheme
- **Expanded editor toolbar** — 7 กลุ่ม (history, heading, inline, align, lists, insert, utilities) sync กับ native menu
- **Native menus** — File, Edit, Insert, Format, Window, Help ครบ (`useAppMenu.ts`)
- **File tree keyboard nav** — ↑↓ Enter, →← expand/collapse, Home/End
- **Sidebar Open folder** — ปุ่ม `FolderOpen` ใน sidebar title bar (`⌘⇧O`)
- **design-pack** — `npm run design-pack` รวม components, styles, hooks, Lucide icons

### Changed

- **Title bar** — icon buttons + overflow menu; Settings มุมขวา; sync scroll ใช้ `accent-subtle`
- **Tab bar** — active accent top border; dirty indicator amber; close on hover
- **Status bar (dark)** — ไม่ใช้สีฟ้าเต็มแถบ
- **Dialogs** — Find/Link ใช้ `dialogs.css` ร่วมกับ Settings
- **Empty states** — sidebar, editor, preview
- **Touch targets** — title bar 40px, editor toolbar 36px

### Documentation

- อัปเดต README, technical-guide, specification, TESTING, TODO
- `docs/editor-toolbar-lucide.md` — อ้างอิง Lucide mapping

## [2026.06.06-23] — 2026-06-06

### Added

- **Formatting MVP** — Editor toolbar, native Format/Insert menus, keyboard shortcuts, Link dialog
- **Toolbar active state** — ปุ่ม inline/list highlight ตาม cursor; heading dropdown sync บรรทัด
- **AC-7** — Testing checklist สำหรับ formatting ใน `docs/TESTING.md`

### Formatting coverage

- **Toolbar** — Heading select, bold/italic/code/highlight/strike, lists, link/code/math/table
- **Shortcuts** — `Cmd+B/I/K/L//`, `` Cmd+` ``, `Cmd+Shift+K`, `Cmd+Option+1…6`
- **Menus** — Format + Insert submenus (callout, footnote, image picker)
- **Link dialog** — URL + label modal แทน prompt สำหรับ Markdown Link

## [2026.06.06-22] — 2026-06-06

### Added

- **Settings MVP** — Modal กลางจอ 4 แท็บ (General, Editor, Files, Export) เปิดจากเมนู, `Cmd+,`, หรือปุ่ม title bar
- **Preferences persist** — ครบทุก field ใน `preferences.json`; flush ก่อนปิดแอป
- **Reset to defaults** — ปุ่ม reset ต่อ section ใน Settings
- **Settings modal a11y** — focus trap, Esc ปิด, คืน focus หลังปิด

### Settings coverage

- **General** — theme, sync scroll, sidebar collapse/width, default view mode
- **Editor** — font size, tab size, line numbers, line wrap
- **Files** — restore last folder, recent folders
- **Export** — PDF theme (app/light/dark), PDF page size (A4/Letter)

## [2026.06.06-21] — 2026-06-06

### Fixed

- **macOS traffic lights** — จัดกึ่งกลางแนวตั้งใน title bar (ปรับ `trafficLightPosition` + ความสูง title bar 52px)

## [2026.06.06-20] — 2026-06-06

### Changed

- **Title bar** — ย้าย tools (Split/Edit/Preview, Find, Sync, Export, Theme) เข้า macOS title bar overlay; ลบแถบ toolbar แยก

## [2026.06.06-19] — 2026-06-06

### Changed

- **Theme** — ย้ายจากปุ่ม Auto บน toolbar เป็นไอคอนมุมขวาของ title bar (กดสลับ Auto → Light → Dark)

## [2026.06.06-18] — 2026-06-06

### Changed

- **Toolbar** — เอา Open/Save ออก (ใช้เมนู File แทน); เหลือ view mode, Find, Sync, Export, Theme
- **Title bar** — แถวชื่อโฟลเดอร์ + ปุ่ม Hide sidebar ด้านขวา (แบบ Obsidian); แสดงปุ่มเปิด sidebar เมื่อซ่อน
- **Status bar** — แสดง word count และ character count

## [2026.06.06-17] — 2026-06-06

### Changed

- **Menu bar** — เรียง `md-editor` → File → Edit; ย้าย About/Quit ไปเมนูแอป; เพิ่ม Edit (Undo/Redo, Cut/Copy/Paste, Select All)

## [2026.06.06-16] — 2026-06-06

### Added

- **Menu File** — Open File, Open Folder, Save, Save As, About MD Editor (native menu bar พร้อม keyboard shortcuts)

## [2026.06.06-15] — 2026-06-06

### Fixed

- **Save (dev)** — ไม่ให้ Vite reload แอปเมื่อบันทึกไฟล์ `.md` (ignore markdown ใน file watcher)
- **Save** — ไม่ refresh file tree หลัง Save ปกติ (tree ไม่เปลี่ยน); Save As ยัง refresh เพื่อแสดงไฟล์ใหม่

## [2026.06.06-14] — 2026-06-06

### Fixed

- **Save** — ไม่ reload/สลับ tab หลังบันทึก; เปิดไฟล์ที่เปิดอยู่แล้วแค่สลับ tab ไม่อ่าน disk ซ้ำ
- **write_file** — ใช้ temp file `filename.md.tmp` แทน `with_extension` ที่เสี่ยงพัง extension

## [2026.06.06-13] — 2026-06-06

### Fixed

- **Save** — อ่านเนื้อหาจาก CodeMirror ก่อนบันทึก ไม่ให้ editor ว่างหลังกด Save

## [2026.06.06-12] — 2026-06-06

### Fixed

- **Quit dialog** — ปุ่ม "Quit Without Saving" ปิดแอปได้จริง (แก้ `ask()` + เรียก `destroy()` หลังยืนยัน)

## [2026.06.06-11] — 2026-06-06

### Fixed

- **Sidebar layout** — เปลี่ยน sidebar เป็น CSS flex คงที่ (240px) แทน resizable panel ที่ติดขนาด ~0%

## [2026.06.06-10] — 2026-06-06

### Fixed

- **Sidebar layout** — แก้ file browser โดน editor ทับ (flex overflow + `panel-fill` wrappers)

## [2026.06.06-9] — 2026-06-06

### Fixed

- **Sync toggle** — ไม่ reload โฟลเดอร์ซ้ำและทำให้ toolbar กระพริบ (แก้ dependency chain ของ `loadFolder` / `restoreLastFolder`)

## [2026.06.06-8] — 2026-06-06

### Added

- **Open File** — ปุ่ม toolbar + `⌘O` เปิดไฟล์ `.md` โดยตรง (ไม่ต้องเปิดโฟลเดอร์ก่อน)
- `⌘⇧O` สำหรับ Open Folder

### Fixed

- File dialog filter เพิ่ม **All Files** เพื่อให้เลือก `.md` ได้บน macOS (Save As ด้วย)

## [2026.06.06-7] — 2026-06-06

### Fixed

- **Sidebar** — render panel ตลอดเวลา ใช้ `collapse()`/`expand()` แทน unmount; ซิงค์สถานะเมื่อลาก resize handle
- **Toolbar** — เปลี่ยนปุ่ม view mode จาก Unicode เป็นข้อความ (`Split` / `Edit` / `Preview`); ปรับ layout ไม่ให้ wrap

## [2026.06.06-6] — 2026-06-06

### Phase 8: Polish & Preferences ✅

- **Persist preferences** — theme, syncScroll, sidebarCollapsed บันทึกอัตโนมัติ
- **MathJax offline** — bundle ใน `public/mathjax/` (ไม่พึ่ง CDN)
- **App icon** — สร้าง icons ด้วย `tauri icon` (`src-tauri/icons/`)
- **Refresh file tree** หลัง Save/Save As ในโฟลเดอร์ที่เปิดอยู่
- Favicon อัปเดตเป็น app icon

### Phase 9: Testing & Build ✅

- `npm run build` ผ่าน
- `npm run tauri build` ผ่นบน macOS (`.app` + `.dmg`)
- เพิ่ม `docs/TESTING.md` — acceptance criteria checklist

### MVP Complete 🎉

Phases 0–9 เสร็จครบตาม [docs/plan.md](./docs/plan.md)

---

## [2026.06.06-5] — 2026-06-06

### Phase 6–7: Sync Scroll + Save ✅

---

## [2026.06.06-4] — 2026-06-06

### Phase 5: Preview Engine ✅

---

## [2026.06.06-3] — 2026-06-06

### Phase 4: CodeMirror Editor ✅

---

## [2026.06.06-2] — 2026-06-06

### Phase 2–3: File Backend + Tree ✅

---

## [2026.06.06-1] — 2026-06-06

### Phase 0–1: Scaffold + Layout ✅
