# MD Editor — Testing Checklist

**Version:** `2026.06.06-23`  
**Last updated:** 2026-06-06

---

## Acceptance Criteria

### AC-1: เปิดโฟลเดอร์และ browse ไฟล์

- [ ] กด Open Folder → เลือกโฟลเดอร์ที่มี `.md`
- [ ] Sidebar แสดง tree structure ถูกต้อง (nested folders)
- [ ] คลิกไฟล์ → เปิด tab และแสดงเนื้อหา
- [ ] Active file highlight ใน tree

### AC-2: Edit และ Preview

- [ ] พิมพ์ `# Hello` → preview แสดง H1 ภายใน ~200ms
- [ ] Code block พร้อม language tag มี syntax highlighting
- [ ] Sync scroll ทำงานใน Split mode (เมื่อเปิด)

### AC-3: Save

- [ ] แก้ไขไฟล์ → tab แสดง `•` (unsaved)
- [ ] กด `Cmd+S` → บันทึกลงไฟล์เดิม
- [ ] เปิดไฟล์ด้วย editor อื่น → เนื้อหาตรงกัน
- [ ] Save As บันทึกไฟล์ใหม่และอัปเดต tab

### AC-4: Markdown ครบถ้วน

ใช้ `examples/sample-docs/markdown-features-test.md`:

- [ ] Tables render ถูกต้อง
- [ ] Task lists แสดง checkbox
- [ ] GitHub Alerts แสดง styled box
- [ ] Mermaid diagram render
- [ ] LaTeX math render (offline bundle)
- [ ] YAML frontmatter แสดง metadata table

### AC-5: Cross-platform build

- [ ] `npm run build` สำเร็จ
- [ ] `npm run tauri build` สำเร็จบน macOS
- [ ] Binary รันได้จาก `src-tauri/target/release/bundle/`

### AC-6: Settings (MVP)

เปิดจาก **md-editor → Settings…**, **`Cmd+,`**, หรือปุ่ม **Settings** ใน title bar

#### Shell

- [ ] Modal เปิด/ปิดได้ (Esc, ปุ่ม ×, คลิก overlay)
- [ ] Tab นำทาง: General | Editor | Files | Export
- [ ] Focus วนอยู่ใน modal (Tab / Shift+Tab)
- [ ] ปิด modal แล้ว focus กลับไป element เดิม

#### General

- [ ] Theme (System / Light / Dark) เปลี่ยนทันที + persist หลัง restart
- [ ] Sync scroll, Collapse sidebar persist
- [ ] Sidebar width slider (180–400px) persist
- [ ] Default view mode → Welcome tab / tab ใหม่ใช้ค่าที่ตั้ง
- [ ] Reset to defaults คืนค่า General

#### Editor

- [ ] Font size (12–20) อัปเดต editor ทันที
- [ ] Tab size (2 / 4) เปลี่ยน indent
- [ ] Line numbers เปิด/ปิด gutter
- [ ] Line wrap เปิด/ปิด horizontal scroll
- [ ] Reset to defaults คืนค่า Editor

#### Files

- [ ] Restore last folder on startup — ปิดแล้ว restart ไม่โหลด folder เก่า
- [ ] Recent folders แสดง list; Clear ล้าง list
- [ ] Reset startup option คืนค่า toggle

#### Export

- [ ] PDF theme: Match app / Light / Dark ส่งผลตอน export PDF
- [ ] PDF page size: A4 / Letter ส่งผลตอน export PDF
- [ ] Reset to defaults คืนค่า Export
- [ ] HTML export ไม่กระทบ

#### Persist

- [ ] `{app_config_dir}/preferences.json` มี field ครบ ไม่มี orphan key
- [ ] ปิดแอปทันทีหลังเปลี่ยน setting → ค่ายังถูกบันทึก (flush on quit)

#### Regression

- [ ] Save / Save As ยังทำงาน
- [ ] Export HTML / PDF ยังทำงาน
- [ ] สลับ tab / view mode ไม่ regression
- [ ] Preview ยัง render ถูกต้อง

### AC-7: Formatting (Toolbar, Menu, Shortcuts)

เปิดไฟล์ `.md` ใน Editor mode หรือ Split mode — toolbar อยู่เหนือ editor

#### Toolbar

- [ ] Heading dropdown sync กับบรรทัดที่ cursor (Body / H1–5)
- [ ] ปุ่ม inline (B, I, <>, ==, ~~) highlight เมื่อ cursor อยู่ใน syntax นั้น
- [ ] ปุ่ม list (•, 1., ☐) highlight เมื่อบรรทัดเป็น list ประเภทนั้น
- [ ] กด B/I toggle wrap — ใส่/ถอด `**` / `*` รอบคำที่เลือก (หรือคำใต้ cursor)
- [ ] ปุ่ม Link เปิด dialog; Insert แล้วได้ `[text](url)`

#### Keyboard shortcuts (editor focused)

- [ ] `Cmd+B` Bold, `Cmd+I` Italic, `Cmd+`` ` Inline code
- [ ] `Cmd+K` Link dialog, `Cmd+L` Task list, `Cmd+/` Comment
- [ ] `Cmd+Shift+K` Code block
- [ ] `Cmd+Option+1…6` Heading 1–6 (ไม่ชน `Cmd+1/2/3` view mode)
- [ ] Shortcut ไม่ทำงานเมื่อ Settings / Find / Link dialog เปิด

#### Native menu

- [ ] **Format** — H1–6, Body, Bold, Italic, Code, Highlight, Strike, Math, Comment
- [ ] **Insert** — Link, Markdown Link (⌘K), Callout, Code/Math block, Table, Footnote, Lists, Image
- [ ] Menu + Toolbar + Shortcut ทำ action เดียวกันได้ผลเหมือนกัน

#### Preview & persist

- [ ] หลัง format → preview แสดงผลถูก (bold, heading, list, link, etc.)
- [ ] `Cmd+S` บันทึก syntax ที่ format แล้วลงไฟล์
- [ ] Export HTML ได้เนื้อหาที่ format แล้ว

#### Regression

- [ ] สลับ tab / view mode ไม่ regression
- [ ] Find/Replace, Settings ยังทำงาน

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

| File | Purpose |
|------|---------|
| `examples/sample-docs/README.md` | Basic navigation |
| `examples/sample-docs/getting-started.md` | Simple content |
| `examples/sample-docs/guides/basics.md` | Nested folder |
| `examples/sample-docs/markdown-features-test.md` | Full feature regression |
