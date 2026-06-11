# 06 — UI / UX Guide

## 6.1 Layout Overview

```
┌─ WindowTitleBar (macOS overlay) ────────────────────────────────┐
│  [Split|Edit|Preview]  Find  Sync  Export HTML        [Theme]   │
├─ SidebarTitleBar ─┬─ TabBar ─────────────────────────────────────┤
│  📁 folder name    │  README.md •  notes.md  [+]  [☰ sidebar]   │
├─ Sidebar ──────────┼─ Editor Pane ────────│ Preview Pane ───────┤
│  [📂][▼][▲][↻][◀] │  EditorToolbar        │  PreviewFontControls │
│  FileTree          │  CodeMirror           │  GitHub-style HTML   │
│                    │  CodeMirror           │                      │
├────────────────────┴───────────────────────┴─────────────────────┤
│ StatusBar: path • words • chars • Modified/Saved                 │
└──────────────────────────────────────────────────────────────────┘
```

## 6.2 View Modes

View mode เก็บ **per-tab** — แต่ละ tab สามารถมี mode ต่างกันได้

| Mode | คำอธิบาย | Default size (split) |
|------|----------|----------------------|
| **Split** | Editor + Preview คู่กัน | 50% / 50% (min 20% each) |
| **Editor** | ซ่อน preview | Editor 100% |
| **Preview** | ซ่อน editor | Preview 100% |

**เปลี่ยน mode ได้จาก:**

- ปุ่มใน WindowTitleBar
- Keyboard: `Cmd/Ctrl + 1/2/3`

Implementation: `react-resizable-panels` ใน `AppShell.tsx` — ซ่อน panel ด้วย conditional render

## 6.3 Sidebar

| Feature | พฤติกรรม |
|---------|----------|
| Width | Slider ใน Settings **180–400px** (`--sidebar-width`) |
| Collapse | ปุ่มใน TabBar หรือ `Cmd/Ctrl + \` |
| File tree | แสดงเฉพาะ `.md` / `.markdown` |
| Active file | Highlight path ที่ตรง active tab |
| Expand/collapse | คลิกโฟลเดอร์, state เก็บใน `expandedPaths` |
| Expand/collapse all | ปุ่มใน `SidebarToolbar` — `expandAllFolders` / `collapseAllFolders` |
| Open folder | ปุ่ม FolderOpen ใน `SidebarToolbar` — `⌘⇧O` |
| Refresh | ปุ่ม ↻ ใน `SidebarToolbar` — re-scan folder (เมื่อมีโฟลเดอร์เปิด) |
| Toolbar bar | แถบแยกใต้ชื่อโฟลเดอร์ (ใน sidebar column), สูง 44px เท่า editor/preview toolbar |
| Empty state | ข้อความแนะนำ "Open a folder" |

**หมายเหตุ:** Drag-resize sidebar แบบ live ยังเป็น **Post-MVP** — ปรับได้จาก Settings slider

## 6.4 Settings

**Modal กลางจอ** — เปิดจากเมนู **Settings…**, `Cmd/Ctrl + ,`, หรือปุ่มใน title bar

| แท็บ | การตั้งค่า | Persist |
|------|-----------|---------|
| **General** | Theme, sync scroll, collapse sidebar, sidebar width, default view mode | `preferences.json` |
| **Editor** | Font size, tab size, line numbers, line wrap | 同上 |
| **Files** | Restore last folder, recent folders (read-only + Clear) | 同上 |
| **Export** | PDF theme (app/light/dark), PDF page size (A4/Letter) | 同上 |

| พฤติกรรม | รายละเอียด |
|----------|------------|
| Apply | ทันที — ไม่ต้องกด Save |
| Debounce | Slider บางตัว debounce 300ms; toggle/select บันทึกทันที |
| Quit flush | `flushPersistPreferences()` ก่อนปิดแอป |
| Reset | ปุ่ม **Reset to defaults** ต่อ section |
| A11y | `role="dialog"`, focus trap, Esc ปิด, คืน focus หลังปิด |

**Quick toggles** ใน title bar (Theme, Sync, View mode) ยังใช้ได้และ sync กับค่าใน Settings

Implementation: `SettingsModal.tsx`, `lib/tauri/preferences.ts`, `usePersistPreferences.ts`

## 6.5 Tab Bar

| Element | พฤติกรรม |
|---------|----------|
| Tab label | ชื่อไฟล์จาก path |
| Dirty indicator | `•` นำหน้าชื่อเมื่อ `isDirty` |
| Close | คลิก × — ถามก่อนถ้ามี unsaved changes |
| New tab | ปุ่ม `+` — เปิด file dialog |
| Sidebar toggle | ปุ่ม ☰ |

## 6.6 Editor UX

| Feature | รายละเอียด |
|---------|------------|
| Font | SF Mono, Fira Code, Cascadia Code, Consolas — ขนาดจาก Settings (12–20px) |
| Line numbers | Gutter ด้านซ้าย — toggle ใน Settings |
| Active line | Border-left highlight บรรทัดที่ cursor อยู่ |
| Line wrap | Toggle ใน Settings |
| Heading style | **Bold เท่านั้น** ไม่มี underline |
| Selection | Native browser selection (ไม่ทับ active line) |
| Find modal | Overlay กลางจอ, ไม่ block editor ด้านหลัง |

### Editor Toolbar

**ไฟล์:** `EditorToolbar.tsx` — อยู่เหนือ CodeMirror ใน editor column (~44px)

**Icons:** Lucide (`lucide-react`) ผ่าน `getFormatIcons()` — ไม่ขึ้นกับ app theme

| กลุ่ม | รายการ |
|------|--------|
| History | Undo, Redo, Clear document |
| Heading | `<select>` Body, H1–6 — sync กับบรรทัดที่ cursor |
| Inline | Bold, Italic, Strikethrough, Code, Highlight, Blockquote, Title/Upper/Lower case |
| Alignment | Align left/center/right, Toggle LTR/RTL (`L`/`R` text button) |
| Lists | Bullet, Numbered, Task, Horizontal rule |
| Insert | Link, Reference, Image, Code/Terminal/Math block, Table, Date/time, Emoji, Symbol, Callout, Footnote |
| Utilities | Fullscreen, Find & Replace, Help, About Markdown |

| พฤติกรรม | รายละเอียด |
|----------|------------|
| Toggle wrap | กด B/I ซ้ำถอด delimiter รอบคำ |
| Selection | `mousedown` + `preventDefault` ไม่ให้ editor blur |
| Disabled | ไม่มี tab/editor → ปุ่ม disabled; Undo/Redo ตาม editor history |
| Scroll | Toolbar scroll แนวนอนได้เมื่อปุ่มล้น (scrollbar ซ่อน) |
| Touch target | ปุ่ม icon 36×36px ในแถบสูง 44px |

## 6.7 Preview UX

| Feature | รายละเอียด |
|---------|------------|
| Style | GitHub Markdown CSS |
| Content width | `.markdown-body` กว้างสูงสุด **700px** (ไม่รวม padding ของ `.preview-content`) |
| Font size | Default **16px** (`--preview-font-size`); ปรับด้วย `PreviewFontControls` (`-` / scale / `+` / reset) |
| Font scale display | เปอร์เซ็นต์เทียบ default (16px = 100); ช่วง 12–28px; persist `previewFontSize` |
| Export | ไม่ใช้ค่า preview font — PDF/HTML ใช้สไตล์ export ของตัวเอง |
| Toolbar | `PreviewFontControls` สูง 44px (`--workspace-toolbar-height`) |
| Theme | ตาม `resolvedColorScheme` (`data-color-mode` บน `.markdown-body`; `data-color-scheme` บน `<html>`) |
| Dark surfaces | `preview-markdown-dark.css` — table rows, inline code, `pre`, hljs ใช้พื้นโทนมืด (ไม่พึ่ง `prefers-color-scheme` อย่างเดียว) |
| Live update | Debounce 100–240ms ตามขนาดเอกสาร |
| Loading | Skeleton shimmer สำหรับเอกสารใหญ่ |
| Sync scroll | Toggle ใน title bar — ratio-based scroll |
| Empty state | "No preview" |
| Mermaid | Render async หลัง DOM commit |
| Math | MathJax typeset async |

## 6.8 Theme System

**Terminology**

| คำ | ความหมาย | ค่า |
|----|----------|-----|
| **Color scheme** | โหมดสว่าง/มืด | `system` / `light` / `dark` |
| **App theme** | ชุดสี + icon tree | `default` / `blue` / `warm` |

**Color scheme cycle:** System → Light → Dark (`ColorSchemeToggle` — Lucide Monitor/Moon/Sun)

| Mechanism | รายละเอียด |
|-----------|------------|
| Storage | `preferences.colorScheme` + `preferences.theme` |
| Apply | `data-color-scheme` + `data-app-theme` บน `<html>` |
| System | `prefers-color-scheme` media query listener → `resolvedColorScheme` |
| Variables | `styles/themes/{default,blue,warm}.css` — `--bg-primary`, `--accent`, etc. |
| Toolbar icons | Lucide — ไม่เปลี่ยนตาม app theme |
| Tree icons | ตาม app theme (`getTreeIcons`) |
| Preview | github-markdown-css + override ใน `preview.css` |
| Editor | CodeMirror theme ผ่าน CSS variables |
| Mermaid | Re-init theme เมื่อ `resolvedColorScheme` เปลี่ยน |

## 6.9 Status Bar

แสดงข้อมูล active tab:

- Full file path
- Word count
- Character count
- **Modified** / **Saved** state

## 6.10 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + O` | Open File |
| `Cmd/Ctrl + Shift + O` | Open Folder |
| `Cmd/Ctrl + S` | Save |
| `Cmd/Ctrl + Shift + S` | Save As |
| `Cmd/Ctrl + F` | Find & Replace |
| `Cmd/Ctrl + W` | Close tab |
| `Cmd/Ctrl + 1` | Split view |
| `Cmd/Ctrl + 2` | Editor only |
| `Cmd/Ctrl + 3` | Preview only |
| `Cmd/Ctrl + ,` | Settings |
| `Cmd/Ctrl + \` | Toggle sidebar |
| `Cmd/Ctrl + B` | Bold (editor focused) |
| `Cmd/Ctrl + I` | Italic |
| `Cmd/Ctrl + K` | Insert link (dialog) |
| `` Cmd/Ctrl + ` `` | Inline code |
| `Cmd/Ctrl + L` | Task list |
| `Cmd/Ctrl + /` | HTML comment wrap |
| `Cmd/Ctrl + Shift + K` | Code block |
| `Cmd/Ctrl + Option + 1…6` | Heading 1–6 |

## 6.11 Native Menu (macOS)

**Hooks:** `useAppMenu.ts` (สร้างเมนู), `useFormatMenuActions.ts` (action handlers)

| Menu | Items |
|------|-------|
| **md-editor** | About, Services, Settings… (`⌘,`), Hide/Others/ShowAll, Quit |
| **File** | Open File (`⌘O`), Open Folder (`⌘⇧O`), Save (`⌘S`), Save As (`⌘⇧S`), Export HTML, Export PDF |
| **Edit** | Undo, Redo, Cut, Copy, Paste, Select All |
| **Insert** | Link (`⌘K`), Reference, Image, Code/Terminal/Math block, Table, Date/time, Emoji, Symbol, Callout, Footnote |
| **Format** | Clear document, H1–6, Body, Bold (`⌘B`), Italic (`⌘I`), Strikethrough, Inline code, Highlight, Blockquote, Title/Upper/Lower case, Align L/C/R, Toggle text direction, Bullet/Numbered/Task list, Horizontal rule |
| **Window** | Split (`⌘1`), Editor (`⌘2`), Preview (`⌘3`), Toggle sidebar (`⌘\`), Find & Replace (`⌘F`), Editor fullscreen, Minimize, Maximize |
| **Help** | Editor Help, About Markdown |

เมนู native sync กับ Editor Toolbar — action เดียวกันผ่าน `runFormatFromMenu` / dialog openers

## 6.12 Dialogs & Confirmations

| สถานการณ์ | Dialog |
|-----------|--------|
| ปิด tab ที่มี unsaved changes | `confirm()` — Save / Don't Save / Cancel |
| ปิดแอปที่มี unsaved tabs | `confirmQuitWithoutSaving()` |
| Open/Save | Native Tauri file dialog |
| Insert link | LinkDialog modal (URL + label) |

## 6.13 Accessibility

| Feature | สถานะ |
|---------|--------|
| `aria-busy` บน preview | ✅ ระหว่าง render |
| Skeleton `aria-hidden` | ✅ |
| Settings modal focus trap | ✅ |
| Keyboard navigation file tree | ✅ ↑↓ Enter Space, →← expand/collapse, Home/End |
| Icon-only buttons `aria-label` | ✅ Title bar, editor toolbar |
| `prefers-reduced-motion` | ✅ globals.css |
| Screen reader สำหรับ preview | ⚠️ จำกัด (HTML content) |

## 6.14 Visual Design Tokens

```css
/* Light */
--bg-primary: #ffffff
--accent: #007aff
--border: #d1d1d6

/* Dark */
--bg-primary: #1e1e1e
--accent: #3794ff
--border: #3e3e42
```

GitHub Alerts ใช้สีแยก light/dark ตาม Markdown-Viewer pattern
