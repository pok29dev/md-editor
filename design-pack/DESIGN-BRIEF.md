# MD Editor — UI Redesign Brief

> ใช้ไฟล์ในโฟลเดอร์นี้กับ AI design tool (Open Design, v0, Stitch, Figma AI ฯลฯ)

## Product

**MD Editor** — Desktop Markdown editor สำหรับ macOS (Tauri v2 + React)

- Local-first, offline, ไม่มี analytics
- อ้างอิง UX จาก **CodeRunner**: sidebar file tree + multi-tab + split editor/preview
- Preview แบบ **GitHub Markdown** style

## Platform & Constraints

| ข้อกำหนด | รายละเอียด |
|----------|------------|
| Platform | macOS desktop (native traffic-light title bar overlay) |
| Tech | React 19 + CSS variables (Tailwind มีแต่ไม่บังคับใน design ใหม่) |
| Color scheme | System / Light / Dark — `data-color-scheme` บน `<html>` |
| App theme | Apple / IBM / Warm — `data-app-theme` + token files |
| Icons | **Lucide** สำหรับ toolbar ทั้งหมด; tree icons ตาม app theme |
| Editor | CodeMirror 6 (monospace) — ไม่เปลี่ยนเป็น WYSIWYG |
| Preview | HTML render จาก Markdown — สไตล์ GitHub |

## Layout (โครงสร้างหลัก — คงไว้)

```
┌─ WindowTitleBar ─────────────────────────────────────────────────┐
│  [Split|Edit|Preview]  🔍 ↕ ⋯                    [🌓] [⚙]      │
├─ SidebarTitleBar ─┬─ TabBar ─────────────────────────────────────┤
│  folder  ↻  ✕    │  README.md •  notes.md  [+]  [☰]            │
├─ Sidebar ──────────┼─ EditorToolbar (scroll) ─│ Preview ─────────┤
│  FileTree          │  CodeMirror              │  GitHub HTML      │
├────────────────────┴────────────────────────┴──────────────────┤
│ StatusBar: path • words • chars • Modified/Saved                 │
└──────────────────────────────────────────────────────────────────┘
```

### Components

1. **WindowTitleBar** — view mode segmented, Find/Sync icons, overflow export menu, color scheme + settings
2. **Sidebar** — collapsible file tree (.md only), keyboard nav
3. **TabBar** — multi-tab, dirty `•`, new tab, sidebar toggle
4. **EditorToolbar** — 7 groups (history, heading, inline, align, lists, insert, utilities)
5. **Editor + Preview** — resizable split (min 20% each)
6. **StatusBar** — path, counts, save state (ไม่ใช้สีฟ้าเต็มแถบใน dark)
7. **Modals** — Settings (4 tabs), Find & Replace, Link + dialogs อื่น
8. **Native menu** — File, Edit, Insert, Format, Window, Help (`useAppMenu.ts`)

## Redesign Goals — ✅ เสร็จแล้ว

- [x] Modern / premium chrome (layered surfaces, subtle accent)
- [x] ลด clutter ใน title bar (icon + overflow)
- [x] Tab bar อ่านง่ายขึ้น (accent top border, dirty amber)
- [x] Sidebar / file tree scan เร็ว (SVG icons, indent guides, keyboard)
- [x] Spacing, radius, typography สม่ำเสมอ (design tokens)
- [x] Dark mode contrast ดีขึ้น (status bar, surfaces)
- [x] Lucide icons ทั้ง title bar + editor toolbar
- [x] Native menu ครบ sync กับ toolbar actions

## Design Tokens

ดูเต็มใน `styles/themes.css` + `styles/themes/{apple,ibm,warm}.css`

```css
/* ตัวอย่าง — Apple light */
--bg-primary: #ffffff
--bg-secondary: #f8f8fa
--accent: #007aff
--accent-subtle: rgba(0,122,255,0.12)
--border-subtle: rgba(0,0,0,0.06)
--status-modified: #ff9f0a
```

## Screenshots

| ไฟล์ | สถานะ |
|------|--------|
| `split-light.png` | ✅ |
| `split-dark.png` | ✅ |
| `settings-general.png` | ✅ |
| `editor-toolbar.png` | ควรจับใหม่หลัง toolbar ขยาย |
| `sidebar-tree.png` | ควรจับใหม่หลัง indent guides |

## ไฟล์ในแพ็กนี้

| โฟลเดอร์ | เนื้อหา |
|----------|---------|
| `docs/` | UI/UX guide, frontend guide, spec, README |
| `styles/` | CSS tokens, layout, dialogs, empty-states, theme layers |
| `components/` | Layout, editor, settings, icons (Lucide + tree) |
| `hooks/` | `useAppMenu.ts`, `useFormatMenuActions.ts` (reference) |
| `screenshots/` | ภาพหน้าจอ |

รัน `npm run design-pack` เพื่อ regenerate แพ็กจาก source ล่าสุด

## Prompt ตัวอย่างสำหรับ AI

```
Use the attached DESIGN-BRIEF, components, CSS, and screenshots for MD Editor.

Keep: sidebar + tabs + split layout, CodeMirror, GitHub preview, native macOS menus,
expanded editor toolbar groups, Lucide icon toolbar.

Style: modern macOS desktop app — content-first, subtle chrome, accent only on active states.
Themes: color scheme (light/dark/system) + app theme (apple/ibm/warm).
```
