# MD Editor — Testing Checklist

**Version:** `26.8.801`  
**Last updated:** 2026-08-08  
**Status:** ✅ ทดสอบผ่าน AC-1 – AC-8; WYSIWYG + local image preview

---

## Acceptance Criteria

### AC-1: เปิดโฟลเดอร์และ browse ไฟล์

- [x] กด Open Folder (sidebar icon, File menu, หรือ `⌘⇧O`) → เลือกโฟลเดอร์ที่มี `.md`
- [x] Sidebar แสดง tree structure ถูกต้อง (nested folders)
- [x] คลิกไฟล์ → เปิด tab และแสดงเนื้อหา
- [x] Active file highlight ใน tree

### AC-2: Edit และ Preview

- [x] พิมพ์ `# Hello` → preview แสดง H1 ภายใน ~200ms
- [x] Code block พร้อม language tag มี syntax highlighting
- [x] Sync scroll ทำงานใน Split mode (เมื่อเปิด)

### AC-3: Save

- [x] แก้ไขไฟล์ → tab แสดง `•` (unsaved)
- [x] กด `Cmd+S` → บันทึกลงไฟล์เดิม
- [x] เปิดไฟล์ด้วย editor อื่น → เนื้อหาตรงกัน
- [x] Save As บันทึกไฟล์ใหม่และอัปเดต tab

### AC-4: Markdown ครบถ้วน

ใช้ `examples/sample-docs/markdown-features-test.md`:

- [x] Tables render ถูกต้อง
- [x] Task lists แสดง checkbox
- [x] GitHub Alerts แสดง styled box
- [x] Mermaid diagram render
- [x] LaTeX math render (offline bundle)
- [x] YAML frontmatter แสดง metadata table
- [x] Local image (`![](assets/...)` หรือ absolute path) แสดงใน preview pane

### AC-5: Cross-platform build

- [x] `npm run build` สำเร็จ
- [x] `npm run tauri build` สำเร็จบน macOS
- [x] Binary รันได้จาก `src-tauri/target/release/bundle/`

### AC-6: Settings (MVP)

เปิดจาก **md-editor → Settings…**, `Cmd+,`, หรือปุ่ม **Settings** ใน title bar

#### Shell

- [x] Modal เปิด/ปิดได้ (Esc, ปุ่ม ×, คลิก overlay)
- [x] Tab นำทาง: General | Editor | Files | Export
- [x] Focus วนอยู่ใน modal (Tab / Shift+Tab)
- [x] ปิด modal แล้ว focus กลับไป element เดิม

#### General

- [x] Color scheme (System / Light / Dark) เปลี่ยนทันที + persist หลัง restart
- [x] App theme (Default / Blue / Warm) เปลี่ยนทันที + persist หลัง restart
- [x] Sync scroll, Collapse sidebar persist
- [x] Sidebar width slider (180–400px) persist
- [x] Default view mode → Welcome tab / tab ใหม่ใช้ค่าที่ตั้ง
- [x] Default edit mode (Source / WYSIWYG) → tab Markdown ใหม่ใช้ค่าที่ตั้ง
- [x] Reset to defaults คืนค่า General

#### Editor

- [x] Font size (12–20) อัปเดต editor ทันที
- [x] Tab size (2 / 4) เปลี่ยน indent
- [x] Line numbers เปิด/ปิด gutter
- [x] Line wrap เปิด/ปิด horizontal scroll
- [x] JSON/YAML syntax colors — GitHub / Custom / Minimal เปลี่ยนสี editor ทันที
- [x] Custom syntax palette — แก้สี 6 token แยก Light/Dark + persist
- [x] Reset to defaults คืนค่า Editor

#### Files

- [x] Restore last folder on startup — ปิดแล้ว restart ไม่โหลด folder เก่า
- [x] Recent folders แสดง list; Clear ล้าง list
- [x] Reset startup option คืนค่า toggle

#### Export

- [x] PDF theme: Match app / Light / Dark ส่งผลตอน export PDF
- [x] PDF page size: A4 / Letter ส่งผลตอน export PDF
- [x] Reset to defaults คืนค่า Export
- [x] HTML export ไม่กระทบ

#### Persist

- [x] `{app_config_dir}/preferences.json` มี field ครบ ไม่มี orphan key
- [x] ปิดแอปทันทีหลังเปลี่ยน setting → ค่ายังถูกบันทึก (flush on quit)

#### Regression

- [x] Save / Save As ยังทำงาน
- [x] Export HTML / PDF ยังทำงาน
- [x] สลับ tab / view mode ไม่ regression
- [x] Preview ยัง render ถูกต้อง

### AC-7: Formatting (Toolbar, Menu, Shortcuts)

เปิดไฟล์ `.md` ใน Editor mode หรือ Split mode — toolbar อยู่เหนือ editor

#### Toolbar

- [x] Heading dropdown sync กับบรรทัดที่ cursor (Body / H1–6)
- [x] ปุ่ม inline (Bold, Italic, Code, Highlight, Strikethrough) highlight เมื่อ cursor อยู่ใน syntax นั้น
- [x] ปุ่ม list (Bullet, Numbered, Task) highlight เมื่อบรรทัดเป็น list ประเภทนั้น
- [x] กด B/I toggle wrap — ใส่/ถอด `**` / `*` รอบคำที่เลือก (หรือคำใต้ cursor)
- [x] ปุ่ม Link เปิด dialog; Insert แล้วได้ `[text](url)`

#### Keyboard shortcuts (editor focused)

- [x] `Cmd+B` Bold, `Cmd+I` Italic, `Cmd+``` Inline code
- [x] `Cmd+K` Link dialog, `Cmd+L` Task list, `Cmd+/` Comment
- [x] `Cmd+Shift+K` Code block
- [x] `Cmd+Option+1…6` Heading 1–6 (ไม่ชน `Cmd+1/2/3` view mode)
- [x] Shortcut ไม่ทำงานเมื่อ Settings / Find / Link dialog เปิด

#### Native menu

- [x] **Format** — H1–6, Body, Bold, Italic, Code, Highlight, Strike, Math, Comment
- [x] **Insert** — Link, Markdown Link (⌘K), Callout, Code/Math block, Table, Footnote, Lists, Image
- [x] Menu + Toolbar + Shortcut ทำ action เดียวกันได้ผลเหมือนกัน

#### Preview & persist

- [x] หลัง format → preview แสดงผลถูก (bold, heading, list, link, etc.)
- [x] `Cmd+S` บันทึก syntax ที่ format แล้วลงไฟล์
- [x] Export HTML ได้เนื้อหาที่ format แล้ว

#### Regression

- [x] สลับ tab / view mode ไม่ regression
- [x] Find/Replace, Settings ยังทำงาน

### AC-8: UI redesign

- [x] Title bar — icon buttons (Find, Sync, overflow), color scheme, settings
- [x] Tab bar — active accent top border, dirty amber dot, close on hover
- [x] Sidebar — open folder icon, refresh, file tree keyboard nav (↑↓ Enter)
- [x] Editor toolbar — Lucide icons ครบ 7 กลุ่ม, active state, horizontal scroll
- [x] Status bar (dark) — ไม่ใช้สีฟ้าเต็มแถบ
- [x] Settings — 4 tabs, color scheme + app theme picker
- [x] Dialogs — Find/Link สไตล์เดียวกับ Settings modal
- [x] Help dialog — แสดง `markdown-help.md` ผ่าน preview pipeline
- [x] App themes — สลับ Default / Blue / Warm แล้ว tokens + tree icons เปลี่ยน

### AC-9: Tabs & multi-window

#### Close All Tabs

- [x] เปิดหลายแท็บ → คลิกขวาที่แท็บใดก็ได้ → **Close All Tabs**
- [x] แท็บที่มี unsaved changes → ถามยืนยันทีละแท็บ; Cancel ยกเลิกทั้งหมด
- [x] หลังปิดครบ → เหลือแท็บ Welcome เดียว

#### Multi-window Save

- [x] File → New Window (`⌘⇧N`) → เปิดไฟล์คนละชุดในแต่ละหน้าต่าง
- [x] แก้ไขใน window รอง → `Cmd+S` บันทึกไฟล์ของแท็บ active ในหน้าต่างนั้น (ไม่ไปที่ main)
- [x] Save As ใน window รอง → อัปเดตแท็บในหน้าต่างนั้น

### AC-10: JSON & YAML files

เปิด `examples/sample-docs/config.json` และ `config.yaml`

#### Open & tree

- [x] Sidebar แสดง `.json` / `.yaml` ร่วมกับ `.md`
- [x] Open File dialog รองรับ Markdown, JSON, YAML, All Files
- [x] Double-click จาก OS เปิดไฟล์ supported ได้

#### Editor

- [x] Syntax highlighting ตามชนิดไฟล์
- [x] ไม่แสดง Markdown toolbar
- [x] เปิดด้วย view mode **Editor only**; ปุ่ม Split/Preview disabled
- [x] Preview pane แสดง empty state

#### Validation & format

- [x] พิมพ์ JSON/YAML invalid → status bar แสดง syntax error
- [x] `⌘⇧F` pretty-print เนื้อหาที่ valid
- [x] Save เมื่อ invalid → ถามยืนยันก่อนบันทึก

#### Settings

- [x] Syntax colors: GitHub / Custom / Minimal เปลี่ยนสีทันที
- [x] Custom palette — แก้สี 6 token แยก Light/Dark + persist หลัง restart

#### Regression

- [x] Markdown tabs ยังมี toolbar + preview ปกติ
- [x] Save / Save As filter ตามชนิดไฟล์ของแท็บ

### AC-11: thClaws & AI Structure

ต้องติดตั้ง `thclaws` CLI และเปิดโฟลเดอร์ใน sidebar ก่อน

#### thClaws view

- [x] Title bar **Editor | thClaws** สลับ view ได้
- [x] View menu → Editor / thClaws มี checkmark ตรงมุมมองที่เลือก
- [x] thClaws view แสดง Run / Stop และ placeholder (ไม่จอขาว)
- [x] กด **Run** → iframe โหลด thClaws web UI; **Stop** หยุด serve
- [x] เปลี่ยน/ปิด folder → serve หยุด; ปิด app → process ไม่ค้าง

#### AI Structure

- [x] Settings → AI Structure — detect CLI, test connection, เปิด config dirs
- [x] Format → **AI Structure Markdown** แสดง diff dialog ก่อน apply
- [ ] Format → **Normalize Markdown** ทำงานโดยไม่ต้อง thClaws

#### Menus

- [x] **View** — Split / Editor Only / Preview, Toggle Sidebar, Editor / thClaws
- [x] **Window** — Minimize, Zoom, Full Screen, Bring All to Front (OS standard)
- [x] **Edit** — Find & Replace (`⌘F`)

---

## Manual Test Commands

```bash
# Frontend build
npm run build

# Dev mode
npm run tauri dev

# Release build (macOS)
npm run tauri build
```

## Sample Files

| File                                             | Purpose                  |
| ------------------------------------------------ | ------------------------ |
| `examples/sample-docs/README.md`                 | Basic navigation         |
| `examples/sample-docs/getting-started.md`        | Simple content           |
| `examples/sample-docs/guides/basics.md`          | Nested folder            |
| `examples/sample-docs/markdown-features-test.md` | Full feature regression  |
| `examples/sample-docs/config.json`               | JSON editor + validation |
| `examples/sample-docs/config.yaml`               | YAML editor + validation |

---

## WYSIWYG (Tiptap) — Manual checklist

ใช้ `examples/sample-docs/markdown-features-test.md` ในโหมด **Editor** + **WYSIWYG**

### โหมดและสลับมุมมอง

- [x] Title bar หรือ `⌘⌥S` สลับ Source ↔ WYSIWYG ได้
- [x] สลับแล้วเนื้อหา heading / list / link ไม่หาย
- [x] JSON/YAML tab ไม่แสดงตัวเลือก WYSIWYG
- [x] Settings → General → Default edit mode เปลี่ยนค่าเริ่มต้นสำหรับ tab ใหม่

### แก้ไขและบันทึก

- [x] พิมพ์ heading, bold, bullet list ใน WYSIWYG แล้ว Save
- [x] เปิดไฟล์ใน editor อื่น → markdown อ่านได้
- [x] Mermaid / math block แสดงเป็น preserved widget (แก้ใน Source ได้)

### Find & Replace

- [x] `⌘F` ใน Source → ค้นหา/แทนที่ทำงาน
- [x] `⌘F` ใน WYSIWYG → dialog แสดง "WYSIWYG", Next/Prev/Replace/Replace All ทำงาน

### Phase 4 shortcuts

- [x] `/` เปิด slash menu (heading, list, table, …)
- [x] Paste / drop รูป → บันทึกใต้ `assets/` ในโฟลเดอร์ workspace
- [x] รูปที่ paste / มีอยู่ในไฟล์ แสดงใน WYSIWYG editor (ไม่ใช่แค่ preview)
- [x] Save แล้ว markdown ยังเป็น relative path (`assets/...`) ไม่กลายเป็น asset URL
- [x] Focus / typewriter mode จาก toolbar

### Automated round-trip

```bash
npm run test:wysiwyg
```

ตรวจ `prepareTiptapBody` / `getTiptapMarkdown` กับไฟล์ใน `examples/sample-docs/`

### Unsaved changes dialog

- [x] แก้ไฟล์ให้ dirty → ปิดแอป → dialog แสดง Save / Quit Without Saving / Cancel
- [x] กด **Cancel** → dialog ปิด กลับมาใช้งานแอปได้
- [x] กด **Save** → บันทึกแล้วแอปปิด
- [x] ปิดแท็บ dirty → Close Without Saving / Save / Cancel ทำงานเหมือนกัน

---

## Pre-merge checklist (`feature/wysiwyg-tiptap` → `main`)

รันก่อน push / merge:

```bash
npm run validate:version   # 26.8.801 ทุกไฟล์ sync
npm run test:wysiwyg       # round-trip tests
npm run build              # tsc + vite
npm run tauri build        # release (macOS) — optional ก่อน tag
```

- [ ] `git log main..HEAD` — 6 commits WYSIWYG + bugfixes
- [ ] Manual WYSIWYG checklist ด้านบน (อย่างน้อย smoke test)
- [ ] Unsaved Cancel ทำงาน (in-app dialog)
- [ ] เปิดไฟล์จาก sidebar ไม่ลบ untitled tab
- [ ] Merge แล้ว tag `v.26.6.2901`
