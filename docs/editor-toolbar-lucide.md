# Editor Toolbar — Markdown-Viewer Reference + Lucide Icons

**Version:** 1.0 (md-editor `2026.06.07-1`)  
**Last updated:** 2026-06-07  
**Purpose:** เอกสารอ้างอิง toolbar ของ [Markdown-Viewer](https://github.com/ThisIs-Developer/Markdown-Viewer) สำหรับ implement ใน md-editor โดยใช้ **lucide-react**

**Source:** `/Users/mrpokx5/development/Markdown-Viewer/index.html` → `#markdown-format-toolbar` (บรรทัด 308–362)

---

## 1. สรุปภาพรวม

Markdown-Viewer ใช้ **Bootstrap Icons** (`<i class="bi bi-*">`) — ไม่มี inline SVG  
md-editor ใช้ **lucide-react** ผ่าน wrapper ใน:

| ไฟล์ | บทบาท |
|------|--------|
| `src/components/icons/lucide/format.tsx` | icon ปุ่ม format/insert ใน editor toolbar |
| `src/components/icons/lucide/toolbar.tsx` | icon ปุ่ม title bar (Find, Sync, Settings ฯลฯ) |
| `src/lib/theme/icons.ts` | `getFormatIcons()` / `getToolbarIcons()` |

**Pattern ที่ใช้อยู่:**

```tsx
import { Bold, type LucideIcon } from "lucide-react";

function lucideIcon(Icon: LucideIcon) {
  return function LucideFormatIcon({ className }: { className?: string }) {
    return <Icon className={className} size={16} strokeWidth={1.75} aria-hidden />;
  };
}

export const BoldIcon = lucideIcon(Bold);
```

---

## 2. Toolbar Layout (Markdown-Viewer)

7 กลุ่ม แยกด้วย `.markdown-toolbar-group` — รวม **38 ปุ่ม**

```
┌─ History ─┬─ Text Style ─┬─ Alignment ─┬─ Headings ─┬─ Lists ─┬─ Insert ────────────────┬─ Utility ─┐
│ Undo      │ Bold         │ Align L     │ H1 H2 H3   │ • list  │ Link Ref Image Code ... │ Fullscreen│
│ Redo      │ Strike       │ Align C     │ H4 H5 H6   │ 1. list │ Table Date Emoji ...    │ Find      │
│ Clear     │ Italic Quote │ Align R Dir │            │ HR      │ Alert                   │ Help Info │
│           │ Aa A a       │             │            │         │                         │           │
└───────────┴──────────────┴─────────────┴────────────┴─────────┴─────────────────────────┴───────────┘
```

---

## 3. รายการปุ่มทั้งหมด + Lucide Mapping

### กลุ่ม 1 — History (3)

| # | Action ID | Title | Bootstrap (MV) | Lucide Icon | Import |
|---|-----------|-------|----------------|-------------|--------|
| 1 | `undo` | Undo | `bi-arrow-counterclockwise` | `Undo2` | `import { Undo2 } from "lucide-react"` |
| 2 | `redo` | Redo | `bi-arrow-clockwise` | `Redo2` | `import { Redo2 } from "lucide-react"` |
| 3 | `clear-formatting` | Clear document | `bi-eraser` | `Eraser` | `import { Eraser } from "lucide-react"` |

> **หมายเหตุ:** Undo/Redo ใน MV เป็น toolbar button — md-editor ใช้ CodeMirror built-in undo (Cmd+Z) อยู่แล้ว ไม่จำเป็นต้องมีปุ่มถ้าไม่ต้องการ parity

---

### กลุ่ม 2 — Text Style (7)

| # | Action ID | Title | Bootstrap (MV) | Lucide Icon | md-editor status |
|---|-----------|-------|----------------|-------------|------------------|
| 4 | `bold` | Bold | `bi-type-bold` | `Bold` | ✅ มีแล้ว |
| 5 | `strike` | Strikethrough | `bi-type-strikethrough` | `Strikethrough` | ✅ มีแล้ว |
| 6 | `italic` | Italic | `bi-type-italic` | `Italic` | ✅ มีแล้ว |
| 7 | `quote` | Blockquote | `bi-quote` | `Quote` | ❌ ยังไม่มี |
| 8 | `title-case` | Title case | ข้อความ `Aa` | **Text label** | ❌ |
| 9 | `uppercase` | Uppercase | ข้อความ `A` | **Text label** | ❌ |
| 10 | `lowercase` | Lowercase | ข้อความ `a` | **Text label** | ❌ |

**Lucide ทางเลือกสำหรับ case transform (ถ้าไม่อยากใช้ text label):**

| Action | Lucide ทางเลือก |
|--------|----------------|
| Title case | `CaseSensitive` |
| Uppercase | `ArrowUpAZ` |
| Lowercase | `ArrowDownAZ` |

---

### กลุ่ม 3 — Alignment (4)

| # | Action ID | Title | Bootstrap (MV) | Lucide Icon | md-editor status |
|---|-----------|-------|----------------|-------------|------------------|
| 11 | `align-left` | Align left | `bi-text-left` | `AlignLeft` | ❌ |
| 12 | `align-center` | Align center | `bi-text-center` | `AlignCenter` | ❌ |
| 13 | `align-right` | Align right | `bi-text-right` | `AlignRight` | ❌ |
| 14 | `direction-toggle` | Switch RTL/LTR | ข้อความ `L` / `R` | `Languages` หรือ `ArrowLeftRight` | ❌ |

> MV ใช้ HTML `<div align="...">` wrapper — ไม่ใช่ standard Markdown ควรพิจารณา out-of-scope หรือทำเป็น HTML insert

---

### กลุ่ม 4 — Headings (6)

| # | Action ID | Title | Bootstrap (MV) | Lucide / UI | md-editor status |
|---|-----------|-------|----------------|-------------|------------------|
| 15–20 | `heading` L1–L6 | Heading 1–6 | ข้อความ `H1`–`H6` | **Dropdown select** | ✅ ใช้ `<select>` แทนปุ่มแยก |

**Lucide ทางเลือก (ถ้าเปลี่ยนเป็น segmented buttons):**

| Level | Lucide |
|-------|--------|
| H1 | `Heading1` |
| H2 | `Heading2` |
| H3 | `Heading3` |
| H4 | `Heading4` |
| H5 | `Heading5` |
| H6 | `Heading6` |

---

### กลุ่ม 5 — Lists (3)

| # | Action ID | Title | Bootstrap (MV) | Lucide Icon | md-editor status |
|---|-----------|-------|----------------|-------------|------------------|
| 21 | `unordered-list` | Bulleted list | `bi-list-ul` | `List` | ✅ `BulletListIcon` |
| 22 | `ordered-list` | Numbered list | `bi-list-ol` | `ListOrdered` | ✅ `NumberedListIcon` |
| 23 | `horizontal-rule` | Horizontal rule | `bi-dash-lg` | `Minus` หรือ `SeparatorHorizontal` | ❌ |

> md-editor มี `TaskListIcon` (`ListTodo`) เพิ่มจาก MV — ไม่มีใน MV toolbar

---

### กลุ่ม 6 — Insert (12)

| # | Action ID | Title | Bootstrap (MV) | Lucide Icon | md-editor status |
|---|-----------|-------|----------------|-------------|------------------|
| 24 | `link` | Link | `bi-link-45deg` | `Link` | ✅ มีแล้ว |
| 25 | `reference` | Reference | CSS `[ ]` | `Bookmark` หรือ `BookMarked` | ❌ |
| 26 | `image` | Image | `bi-card-image` | `Image` | ⚠️ action มีใน `formatActions` แต่ไม่มีปุ่ม toolbar |
| 27 | `inline-code` | Inline code | `bi-code-slash` | `Code` | ✅ มีแล้ว |
| 28 | `code-block` | Code block | `bi-file-code` | `SquareCode` | ✅ มีแล้ว |
| 29 | `terminal-block` | Terminal block | `bi-terminal` | `Terminal` | ❌ |
| 30 | `table` | Table | `bi-table` | `Table` | ✅ มีแล้ว |
| 31 | `date-time` | Date and time | `bi-clock` | `Clock` | ❌ |
| 32 | `emoji` | Emoji shortcode | `bi-emoji-smile` | `Smile` | ❌ |
| 33 | `symbols` | Symbols & HTML entities | `bi-c-circle` | `Copyright` หรือ `CircleDot` | ❌ |
| 34 | `alert` | Markdown alert | `bi-newspaper` | `Megaphone` หรือ `TriangleAlert` | ⚠️ มี callout actions ใน menu แต่ไม่มีปุ่ม toolbar |

**md-editor เพิ่มจาก MV (ไม่มีใน MV toolbar):**

| Action | Lucide | md-editor status |
|--------|--------|------------------|
| Highlight | `Highlighter` | ✅ |
| Math block | `Sigma` | ✅ |
| Footnote | `Superscript` หรือ `Asterisk` | ⚠️ action มี ไม่มีปุ่ม |

---

### กลุ่ม 7 — Utility (4)

| # | Action ID | Title | Bootstrap (MV) | Lucide Icon | md-editor status |
|---|-----------|-------|----------------|-------------|------------------|
| 35 | `fullscreen` | Fullscreen | `bi-arrows-fullscreen` | `Maximize2` | ❌ (editor pane) |
| 36 | `find` | Find & Replace | `bi-search` | `Search` | ✅ ใน title bar (`FindIcon`) |
| 37 | `help` | Help | `bi-question-circle` | `CircleHelp` | ❌ |
| 38 | `info` | About Markdown | `bi-info-circle` | `Info` | ❌ |

---

## 4. Gap Analysis — md-editor vs Markdown-Viewer

### 4.1 มีแล้วใน md-editor toolbar

| ปุ่ม | Lucide | ไฟล์ |
|------|--------|------|
| Heading dropdown | — (select) | `EditorToolbar.tsx` |
| Bold | `Bold` | `lucide/format.tsx` |
| Italic | `Italic` | 同上 |
| Inline code | `Code` | 同上 |
| Highlight | `Highlighter` | 同上 |
| Strikethrough | `Strikethrough` | 同上 |
| Bullet list | `List` | 同上 |
| Numbered list | `ListOrdered` | 同上 |
| Task list | `ListTodo` | 同上 |
| Link (dialog) | `Link` | 同上 |
| Code block | `SquareCode` | 同上 |
| Math block | `Sigma` | 同上 |
| Table | `Table` | 同上 |

### 4.2 ยังไม่มี — แนะนำ priority สำหรับ implement

| Priority | Action | Lucide | เหตุผล |
|----------|--------|--------|--------|
| P1 | Blockquote | `Quote` | Markdown มาตรฐาน, implement ง่าย (line prefix `> `) |
| P1 | Horizontal rule | `Minus` | insert `---\n` |
| P1 | Image | `Image` | action มีแล้ว แค่เพิ่มปุ่ม + file picker |
| P2 | Alert / Callout | `Megaphone` | action มีใน menu (`calloutNote` ฯลฯ) |
| P2 | Footnote | `Superscript` | action มีแล้ว |
| P2 | Terminal block | `Terminal` | insert ` ```shell ` fence |
| P3 | Undo / Redo | `Undo2` / `Redo2` | CM มี built-in — ปุ่ม optional |
| P3 | Clear document | `Eraser` | ต้อง confirm modal |
| P3 | Date/time | `Clock` | insert timestamp |
| P3 | Emoji | `Smile` | ต้อง picker UI |
| P3 | Symbols | `Copyright` | ต้อง picker UI |
| P3 | Reference | `Bookmark` | footnote-style `[n]` syntax |
| P4 | Case transform | text / `CaseSensitive` | niche feature |
| P4 | Text alignment | `AlignLeft` ฯลฯ | HTML-only, ไม่ใช่ MD มาตรฐาน |
| P4 | RTL toggle | `Languages` | niche |
| P4 | Fullscreen | `Maximize2` | editor pane feature |
| P4 | Help / About | `CircleHelp` / `Info` | modal content |

---

## 5. Proposed Lucide Exports (implement checklist)

เพิ่มใน `src/components/icons/lucide/format.tsx`:

```tsx
import {
  // existing
  Bold, Code, Highlighter, Italic, Link, List, ListOrdered, ListTodo,
  Sigma, SquareCode, Strikethrough, Table,
  // new — P1
  Quote, Minus, Image,
  // new — P2
  Megaphone, Superscript, Terminal,
  // new — P3 (optional)
  Undo2, Redo2, Eraser, Clock, Smile, Copyright, Bookmark,
  // new — P4 (optional)
  AlignLeft, AlignCenter, AlignRight, Languages,
  CaseSensitive, ArrowUpAZ, ArrowDownAZ,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
} from "lucide-react";

// P1
export const QuoteIcon = lucideIcon(Quote);
export const HorizontalRuleIcon = lucideIcon(Minus);
export const ImageIcon = lucideIcon(Image);

// P2
export const AlertIcon = lucideIcon(Megaphone);
export const FootnoteIcon = lucideIcon(Superscript);
export const TerminalIcon = lucideIcon(Terminal);

// P3 (optional)
export const UndoIcon = lucideIcon(Undo2);
export const RedoIcon = lucideIcon(Redo2);
export const ClearIcon = lucideIcon(Eraser);
export const DateTimeIcon = lucideIcon(Clock);
export const EmojiIcon = lucideIcon(Smile);
export const SymbolsIcon = lucideIcon(Copyright);
export const ReferenceIcon = lucideIcon(Bookmark);
```

เพิ่มใน `src/components/icons/lucide/toolbar.tsx` (utility — ถ้าไม่ย้ายไป editor toolbar):

```tsx
import { CircleHelp, Info, Maximize2 } from "lucide-react";

export const HelpIcon = lucideIcon(CircleHelp);
export const AboutIcon = lucideIcon(Info);
export const FullscreenIcon = lucideIcon(Maximize2);
```

---

## 6. Proposed Toolbar Layout (md-editor extended)

แนวทาง parity กับ Markdown-Viewer แต่คง Obsidian-style ของ md-editor:

```
┌─ [Heading ▾] ─┬─ Inline ──────────────┬─ Lists ───────┬─ Insert ──────────────────────┐
│ Body / H1–H5  │ B I Code Highlight ~~ │ • 1. ☐        │ 🔗 ``` Σ ⊞ 🖼 ❝ ─ 📢        │
└───────────────┴───────────────────────┴───────────────┴───────────────────────────────┘
                 Quote (optional)                         Image HR Alert (P1 additions)
```

**กลุ่มที่แนะนำเพิ่ม (Phase 1):**

```tsx
const blockButtons = [
  { id: "quote", title: "Blockquote", Icon: icons.QuoteIcon },
  { id: "horizontalRule", title: "Horizontal rule", Icon: icons.HorizontalRuleIcon },
];

const extendedInsertButtons = [
  ...insertButtons,
  { id: "image", title: "Insert image", Icon: icons.ImageIcon },
  { id: "calloutNote", title: "Alert / Callout", Icon: icons.AlertIcon },
];
```

---

## 7. Action ID Mapping

| Markdown-Viewer `data-md-action` | md-editor `FormatActionId` | หมายเหตุ |
|----------------------------------|---------------------------|----------|
| `undo` | — | ใช้ CM `undoDepth()` / `dispatch undo` |
| `redo` | — | ใช้ CM redo |
| `clear-formatting` | — | ต้อง action ใหม่ |
| `bold` | `bold` | ✅ |
| `strike` | `strikethrough` | ✅ |
| `italic` | `italic` | ✅ |
| `quote` | — | ต้อง action ใหม่: line prefix `> ` |
| `title-case` / `uppercase` / `lowercase` | — | transform selection text |
| `align-left/center/right` | — | HTML wrapper insert |
| `direction-toggle` | — | editor `direction` CSS |
| `heading` L1–L6 | `heading1`…`heading6` | ✅ |
| `unordered-list` | `bulletList` | ✅ |
| `ordered-list` | `numberedList` | ✅ |
| `horizontal-rule` | — | insert `\n---\n` |
| `link` | `linkPrompt` | ✅ (via dialog) |
| `reference` | `footnote`? | MV ใช้ `[n]` reference style |
| `image` | `image` | ✅ (needs picker) |
| `inline-code` | `code` | ✅ |
| `code-block` | `codeBlock` | ✅ |
| `terminal-block` | — | fenced block lang=`shell` |
| `table` | `table` | ✅ |
| `date-time` | — | insert ISO/local timestamp |
| `emoji` | — | insert `:smile:` shortcode |
| `symbols` | — | picker modal |
| `alert` | `calloutNote` | ✅ (menu only) |
| `fullscreen` | — | editor pane UI |
| `find` | — | title bar Find |
| `help` / `info` | — | modal |

---

## 8. Lucide Quick Reference (copy-paste)

```tsx
// History
Undo2, Redo2, Eraser

// Text style
Bold, Italic, Strikethrough, Quote, Code, Highlighter
CaseSensitive, ArrowUpAZ, ArrowDownAZ  // case transform

// Alignment
AlignLeft, AlignCenter, AlignRight, Languages

// Headings
Heading1, Heading2, Heading3, Heading4, Heading5, Heading6

// Lists
List, ListOrdered, ListTodo, Minus

// Insert
Link, Bookmark, Image, SquareCode, Terminal, Table
Clock, Smile, Copyright, Megaphone, Sigma, Superscript

// Utility
Maximize2, Search, CircleHelp, Info
```

**Lucide docs:** https://lucide.dev/icons/

---

## 9. Implementation Notes

1. **Icon size:** ใช้ `size={16}` และ `strokeWidth={1.75}` ให้สอดคล้องกับ `lucide/format.tsx` ปัจจุบัน
2. **Text buttons:** ปุ่ม `Aa`, `H1`, `L` ใน MV ใช้ class `text-tool` — ถ้าต้องการ parity ใช้ `<span>` label แทน icon ไม่ต้องมี Lucide
3. **Reference icon:** MV ใช้ CSS `content: "[ ]"` — ทางเลือกใน md-editor คือ `Bookmark` หรือ text label `[ ]`
4. **Theme icons:** `getFormatIcons()` คืน lucide ทุก theme แล้ว — ไม่ต้อง duplicate ใน apple/ibm/warm
5. **Find button:** อยู่ title bar ไม่ใช่ editor toolbar — ไม่ต้อง duplicate ใน `EditorToolbar`
6. **New actions:** ก่อนเพิ่มปุ่ม ต้องเพิ่ม `FormatActionId` + handler ใน `formatActions.ts` ก่อน

---

## 10. Related Files

| ไฟล์ | บทบาท |
|------|--------|
| `src/components/editor/EditorToolbar.tsx` | UI toolbar ปัจจุบัน |
| `src/components/icons/lucide/format.tsx` | Lucide icon exports |
| `src/lib/editor/formatActions.ts` | insert logic |
| `docs/formatting-tools-plan.md` | plan งาน formatting MVP (ปิดแล้ว) |
