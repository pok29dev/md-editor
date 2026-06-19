# MD Editor — Formatting Tools Plan

**Version:** 0.1  
**Last updated:** 2026-06-06  
**Status:** Phase F-5 complete — Formatting MVP ปิดงาน  
**อ้างอิง:** [specification.md §1.4](./specification.md), [technical-guide/03-frontend.md](../technical-guide/03-frontend.md), [technical-guide/06-ui-ux.md](../technical-guide/06-ui-ux.md)

---

## 1. เป้าหมาย

เพิ่ม **Formatting Tools** ใน Editor เพื่อช่วยใส่ **Markdown syntax** โดยไม่ต้องพิมพ์ delimiter เองทั้งหมด

Deliverable หลัก:

1. **เมนู Format** (native macOS menu + ทางเลือก dropdown ใน toolbar)
2. **เมนู Insert** (native menu)
3. **Editor Toolbar** — แถบปุ่มเหนือ CodeMirror ใน editor pane
4. **Keyboard shortcuts** สำหรับ action ที่ใช้บ่อย

> หมายเหตุ: Feature นี้เป็น **syntax inserter** ไม่ใช่ WYSIWYG — ผู้ใช้ยังเห็นและแก้ Markdown source ใน CodeMirror ตามเดิม

---

## 2. อ้างอิง UI (Obsidian-style)

จาก mockup ที่ต้องการ:

### Format menu

| รายการ | Markdown ที่ insert |
|--------|---------------------|
| Heading 1–6 | `# ` … `###### ` (line prefix) |
| Body | ลบ heading prefix ของบรรทัด |
| Bold | `**text**` |
| Italics | `*text*` |
| Code | `` `text` `` |
| Highlight | `==text==` |
| Strikethrough | `~~text~~` |
| Math | `$text$` (inline) |
| Comment | `<!-- text -->` |

### Insert menu

| รายการ | Markdown ที่ insert |
|--------|---------------------|
| Link | `[text](url)` |
| Markdown Link | prompt URL → `[selection](url)` |
| Callout | `> [!NOTE]\n> ` block |
| Code Block | ` ```\n\n``` ` |
| Math Block | `$$\n\n$$` |
| Table | template 3×3 GFM |
| Footnote | `[^1]` + placeholder definition |
| Bullet List | `- ` line prefix |
| Numbered List | `1. ` line prefix |
| Task List | `- [ ] ` line prefix |
| Insert Attachment | `![alt](path)` — เปิด file picker |
| Folding | Post-MVP |

---

## 3. สถานะปัจจุบัน (Baseline)

### 3.1 มีแล้ว

| ส่วน | รายละเอียด |
|------|------------|
| Editor | CodeMirror 6 ใน `MarkdownEditor.tsx` / `tabEditorCache.ts` |
| Active view | `useEditorStore().view` — `EditorView` ของ tab ปัจจุบัน |
| Native menu | `useAppMenu.ts` — md-editor, File, Edit |
| Title bar tools | View mode, Find, Sync, Export, Theme |
| Preview engine | รองรับ GFM, `==highlight==`, alerts, footnotes, math, mermaid |
| Find/Replace | pattern ใช้ `editorStore.view` + CM search API |

### 3.2 ยังไม่มี

| ปัญหา | รายละเอียด |
|-------|------------|
| Insert API | ไม่มี helper สำหรับ wrap/prefix/insert block |
| Format menu | ไม่มีเมนู Format / Insert |
| Editor toolbar | `EditorPane` มีแค่ CodeMirror ไม่มี toolbar |
| Format shortcuts | ไม่มี `Cmd+B`, `Cmd+I`, `Cmd+K` ฯลฯ |
| Active style state | toolbar ไม่รู้ว่าบรรทัดปัจจุบันเป็น H2 หรือ list |

### 3.3 Preview compatibility matrix

| Action | Syntax | Preview | หมายเหตุ |
|--------|--------|---------|----------|
| Heading 1–6 | `#` … `######` | ✅ | line-based |
| Body | ลบ `#+` prefix | ✅ | |
| Bold / Italic / Code / Strike | GFM inline | ✅ | wrap selection |
| Highlight | `==text==` | ✅ | custom marked ext |
| Inline math | `$...$` | ✅ | MathJax |
| HTML comment | `<!-- -->` | ✅ | ไม่แสดงใน preview |
| Link | `[t](url)` | ✅ | |
| Callout | `> [!NOTE]` | ✅ | `enhanceGitHubAlerts` |
| Code block | fenced ``` | ✅ | |
| Math block | `$$...$$` | ✅ | |
| Table | GFM `\|...\|` | ✅ | insert template |
| Footnote | `[^id]` | ✅ | `footnotes.ts` |
| Bullet / Numbered / Task | list markers | ✅ | line prefix |
| Image / attachment | `![alt](path)` | ✅ | ต้อง path ถูกต้อง |
| Folding | CM fold / `%% fold` | ❌ | Post-MVP |

---

## 4. หลักการออกแบบ

### 4.1 Architecture

```
EditorToolbar / Native Menu / Keyboard
              ↓
    useMarkdownFormat() hook
              ↓
    lib/editor/formatActions.ts   ← pure insert logic
              ↓
    editorStore.view.dispatch()   ← CodeMirror Transaction
              ↓
    tab onChange → appStore (isDirty)
              ↓
    Preview re-render (debounced)
```

**แนะนำ:** แยก **logic** (`formatActions.ts`) ออกจาก **UI** — ทดสอบง่าย, menu กับ toolbar ใช้ action เดียวกัน

### 4.2 พฤติกรรม insert (สำคัญ)

| ประเภท | มี selection | ไม่มี selection (cursor) |
|--------|-------------|-------------------------|
| **Wrap** (bold, italic, code…) | wrap ข้อความที่เลือก | insert delimiter คู่ + cursor ตรงกลาง |
| **Line prefix** (heading, list) | apply ทุกบรรทัดใน selection | apply บรรทัดที่ cursor อยู่ |
| **Block** (code fence, callout) | แทรก block ใหม่ที่ cursor/หลัง selection | 同上 |
| **Toggle** (heading → body) | ถ้าบรรทัดมี prefix อยู่แล้ว → ลบ/สลับ | 同上 |

**Cursor placement:** หลัง insert ต้อง `view.focus()` และวาง cursor ในตำแหน่งที่พิมพ์ต่อได้ทันที

**History:** ใช้ CM transaction ปกติ → undo/redo ทำงานอัตโนมัติ

### 4.3 ขอบเขต MVP vs Post-MVP

| MVP | Post-MVP |
|-----|----------|
| Format + Insert menus (native) | Toolbar dropdown แบบ Obsidian (รายการยาว) |
| Editor toolbar (ปุ่มหลัก ~12 รายการ) | Emoji picker |
| Wrap + line prefix + block insert | Folding / fold markers |
| Link dialog (prompt URL) | Wikilink `[[note]]` |
| Image จาก file picker | Drag-drop image |
| Shortcuts: B, I, K, `, L (task) | Custom shortcut editor |
| Callout subtype picker (NOTE/TIP/…) | Table builder UI (grid picker) |

---

## 5. Data Model & Config

**ไม่ต้อง** เพิ่ม `AppPreferences` ใน MVP — toolbar แสดงเสมอเมื่อ editor visible

Post-MVP (optional):

```typescript
interface FormatPreferences {
  showEditorToolbar: boolean;      // default true
  toolbarStyle: "compact" | "full"; // default compact
}
```

---

## 6. Implementation Phases

### Phase F-1: Format Actions Core

**เป้าหมาย:** engine ใส่ syntax ผ่าน CodeMirror

| Task | Priority | ไฟล์ |
|------|----------|------|
| สร้าง `FormatAction` type + registry | P0 | `lib/editor/formatActions.ts` |
| `wrapSelection(before, after, placeholder?)` | P0 | 同上 |
| `toggleLinePrefix(prefix, regex?)` | P0 | 同上 |
| `insertBlock(template, cursorOffset?)` | P0 | 同上 |
| `setHeading(level 1–6)` / `setBody()` | P0 | 同上 |
| `applyFormatAction(view, actionId)` entry point | P0 | 同上 |
| Unit tests สำหรับ string transform (optional) | P2 | `formatActions.test.ts` |

**Deliverable:** เรียก `applyFormatAction(view, "bold")` แล้วได้ `**text**` ถูกต้อง

**Verify:**
- [ ] Wrap กับ/ไม่มี selection
- [ ] Multi-line selection → heading/list apply ทุกบรรทัด
- [ ] Undo กลับได้
- [ ] `onChange` อัปเดต tab content

**ประมาณ effort:** 1–2 วัน

---

### Phase F-2: Hook + Editor Toolbar

**เป้าหมาย:** UI toolbar ใน editor pane

| Task | Priority | ไฟล์ |
|------|----------|------|
| `useMarkdownFormat()` — อ่าน `editorStore.view`, dispatch action | P0 | `hooks/useMarkdownFormat.ts` |
| `EditorToolbar.tsx` — ปุ่ม + tooltip + shortcut hint | P0 | `components/editor/EditorToolbar.tsx` |
| ใส่ toolbar ใน `EditorPane.tsx` เหนือ `MarkdownEditor` | P0 | `components/layout/EditorPane.tsx` |
| Styles — แถบบาง, icon หรือ label, responsive overflow | P1 | `styles/editor-toolbar.css` |
| Disable ปุ่มเมื่อไม่มี active editor view | P1 | `EditorToolbar.tsx` |

**Toolbar MVP layout (แนะนำ):**

```
[H▾] [B] [I] [<>] [==] [~~] | [•] [1.] [☐] | [🔗] [```] [📊] [⊞]
 ↑ dropdown heading    inline styles          lists          insert
```

**Deliverable:** คลิก Bold ใน toolbar → ข้อความที่เลือกถูก wrap

**Verify:**
- [ ] Toolbar แสดงใน Split + Editor mode
- [ ] Toolbar ซ่อนใน Preview-only mode
- [ ] สลับ tab แล้ว action ใช้ editor ของ tab ที่ active
- [ ] ไม่ regression layout / resize

**ประมาณ effort:** 1–2 วัน

---

### Phase F-3: Native Format + Insert Menus

**เป้าหมาย:** เมนู macOS ตาม mockup

| Task | Priority | ไฟล์ |
|------|----------|------|
| เพิ่ม **Format** submenu ใน `useAppMenu.ts` | P0 | `hooks/useAppMenu.ts` |
| เพิ่ม **Insert** submenu | P0 | 同上 |
| Wire action → `handlersRef` → `applyFormatAction` | P0 | 同上 |
| Accelerators ตามมาตรฐาน (B, I, K, L, /) | P0 | 同上 |
| Separator ตาม mockup (Headings | Inline | Extra) | P1 | 同上 |

**Format menu structure:**

```
Format
├── Heading 1 … Heading 6
├── Body
├── ─────────
├── Bold          ⌘B
├── Italics       ⌘I
├── Code
├── Highlight
├── ─────────
├── Strikethrough
├── Math
└── Comment       ⌘/
```

**Insert menu structure:**

```
Insert
├── Link
├── Markdown Link     ⌘K
├── Callout           → submenu: Note, Tip, Important, Warning, Caution
├── ─────────
├── Code Block
├── Math Block
├── Table
├── Footnote
├── ─────────
├── Bullet List
├── Numbered List
├── Task List         ⌘L
├── ─────────
└── Insert Image…     (file picker)
```

**Deliverable:** เลือก Format → Bold จาก menu bar ทำงานเหมือน toolbar

**Verify:**
- [ ] Menu ทำงานเมื่อ editor focused
- [ ] Menu item disabled เมื่อไม่มี document/tab
- [ ] ไม่ conflict กับ Edit menu (Cut/Copy/Paste ยังเป็น native)

**ประมาณ effort:** 1 วัน

---

### Phase F-4: Keyboard Shortcuts + Dialogs ✅

**เป้าหมาย:** shortcut ครบ + UX สำหรับ link/image

| Task | Priority | ไฟล์ | Status |
|------|----------|------|--------|
| `Cmd+B/I/K/L//` ใน `useKeyboardShortcuts` | P0 | `hooks/useKeyboardShortcuts.ts` | ✅ |
| **Link dialog** — mini modal URL + text | P0 | `components/editor/LinkDialog.tsx` | ✅ |
| `formatShortcuts.ts` — guard focus/modal | P0 | `lib/editor/formatShortcuts.ts` | ✅ |
| **Image insert** — `open()` file picker → relative/absolute path | P1 | `useFormatMenuActions.ts` | ✅ (F-3) |
| **Callout** — insert `> [!TYPE]\n> ` | P0 | `formatActions.ts` | ✅ (F-1) |
| **Table template** — 3 col default | P1 | `formatActions.ts` | ✅ (F-1) |
| **Footnote** — auto-increment `[^n]` | P2 | `formatActions.ts` | ✅ (F-1) |

**Shortcut map (MVP):**

| Shortcut | Action |
|----------|--------|
| `Cmd+B` | Bold |
| `Cmd+I` | Italic |
| `Cmd+K` | Markdown Link |
| `Cmd+`` ` | Inline code |
| `Cmd+L` | Task list (toggle line) |
| `Cmd+/` | HTML comment wrap |
| `Cmd+Shift+K` | Code block (optional — ไม่ชน Link) |
| `Cmd+Alt+1…6` | Heading 1–6 (optional — ไม่ชน view mode) |

> **Conflict note:** `Cmd+1/2/3` ใช้ view mode อยู่แล้ว — heading shortcuts ใช้ `Cmd+Alt+1…6` หรือ menu only

**Deliverable:** `Cmd+K` → ใส่ link ให้ selection

**Verify:**
- [x] Shortcut ไม่ทำงานเมื่อ focus อยู่ใน Settings modal / input อื่น
- [x] Link dialog cancel ไม่แก้ document

**ประมาณ effort:** 1–2 วัน

---

### Phase F-5: Polish, Active State & Docs ✅

**เป้าหมาย:** ปิดงาน formatting MVP

| Task | Priority | Status |
|------|----------|--------|
| Toolbar active state (บรรทัดเป็น H2 → highlight H2) | P1 | ✅ |
| Heading dropdown แทนปุ่ม H เดียว | P1 | ✅ (F-2) |
| อัปเดต `docs/TESTING.md` — AC-7 Formatting | P0 | ✅ |
| อัปเดต `technical-guide/06-ui-ux.md` § Editor Toolbar | P0 | ✅ |
| อัปเดต `technical-guide/03-frontend.md` § formatActions | P1 | ✅ |
| อัปเดต `CHANGELOG.md` + bump version | P1 | ✅ |
| แก้ `specification.md` §1.4 — เอา "formatting toolbar" ออกจาก out-of-scope | P1 | ✅ |

**Verify (รวม):**
- [x] Menu + Toolbar + Shortcuts ทำ action เดียวกันได้ผลเหมือนกัน
- [x] Preview แสดงผลถูกต้องหลัง format
- [x] Save/export ได้เนื้อหาที่ format แล้ว
- [x] ไม่ regression Settings, tab switch, find/replace

**ประมาณ effort:** 1 วัน

---

## 7. โครงสร้างไฟล์ใหม่

```
src/
├── components/
│   └── editor/
│       ├── EditorToolbar.tsx       # F-2
│       ├── LinkDialog.tsx          # F-4 ✅
│       └── MarkdownEditor.tsx      # (existing)
├── hooks/
│   ├── useMarkdownFormat.ts        # F-2
│   └── useAppMenu.ts               # F-3 extend
├── lib/
│   └── editor/
│       ├── formatActions.ts        # F-1 core
│       └── formatRegistry.ts       # F-1 action definitions (optional split)
└── styles/
    └── editor-toolbar.css          # F-2
```

---

## 8. รายละเอียด `formatActions.ts` ( sketch )

```typescript
export type FormatActionId =
  | "heading1" | "heading2" | "heading3" | "heading4" | "heading5" | "heading6"
  | "body"
  | "bold" | "italic" | "code" | "highlight" | "strikethrough" | "mathInline" | "comment"
  | "link" | "linkPrompt"
  | "calloutNote" | "calloutTip" | /* … */
  | "codeBlock" | "mathBlock" | "table" | "footnote"
  | "bulletList" | "numberedList" | "taskList"
  | "image";

export function applyFormatAction(view: EditorView, id: FormatActionId, ctx?: FormatContext): void;
```

**ตัวอย่าง wrap:**

```typescript
function wrapSelection(view: EditorView, before: string, after: string, placeholder = "") {
  const { from, to } = view.state.selection.main;
  const text = view.state.sliceDoc(from, to) || placeholder;
  view.dispatch({
    changes: { from, to, insert: `${before}${text}${after}` },
    selection: { anchor: from + before.length + text.length + (text ? 0 : 0) },
  });
}
```

**ตัวอย่าง line prefix (heading):**

```typescript
function setHeadingLevel(view: EditorView, level: number) {
  const prefix = "#".repeat(level) + " ";
  toggleLinePrefix(view, prefix, /^#{1,6}\s+/);
}
```

---

## 9. UI Placement

```
┌─ WindowTitleBar (view, find, export, theme) ─────────────────────┐
├─ Sidebar ──┬─ TabBar ───────────────────────────────────────────┤
│            ├─ EditorToolbar  ← NEW (F-2)                        │
│            ├─ CodeMirror                                          │
│            │                                                      │
│            ├─ Preview (split mode)                                │
└────────────┴──────────────────────────────────────────────────────┘
```

- Toolbar อยู่ **ใน editor column** ไม่ใช่ title bar — แยกจาก global tools
- ความสูง ~36px, `flex-shrink: 0`
- ใช้ CSS variables เดิม (`--bg-secondary`, `--border`)

---

## 10. Timeline สรุป

| Phase | ชื่อ | Effort | Dependency |
|-------|------|--------|------------|
| **F-1** | Format actions core | 1–2 วัน | — |
| **F-2** | Editor toolbar | 1–2 วัน | F-1 |
| **F-3** | Native Format + Insert menus | 1 วัน | F-1 |
| **F-4** | Shortcuts + dialogs | 1–2 วัน | F-1 |
| **F-5** | Polish & docs | 1 วัน | F-2–F-4 |

**รวมประมาณ:** 5–8 วัน (part-time) หรือ 3–4 วัน (full-time)

**ลำดับแนะนำ:** F-1 → F-2 + F-3 (parallel) → F-4 → F-5

---

## 11. Acceptance Criteria (Formatting MVP)

1. มี **Format** และ **Insert** ใน menu bar
2. มี **Editor Toolbar** เหนือ editor เมื่ออยู่ Split/Editor mode
3. Action หลัก (bold, italic, heading, lists, code block, link) ทำงานกับ selection และ cursor
4. Preview แสดงผล syntax ที่ insert ถูกต้อง
5. Undo/redo ทำงาน
6. เอกสาร TESTING + technical-guide อัปเดต

---

## 12. Out of Scope (ยืนยันไม่ทำใน Formatting MVP)

- WYSIWYG / rich text editing
- Floating selection bubble (Medium-style)
- Collaborative cursors
- Custom Markdown flavors นอกเหนือจากที่ preview รองรับ
- Folding UI
- Table grid picker

---

## 13. Checklist สำหรับ implement แต่ละ Phase

```markdown
### Phase F-X

- [ ] formatActions / UI component
- [ ] Wire menu + toolbar + shortcuts
- [ ] Manual test ตาม Verify
- [ ] Preview regression (sample-docs)
- [ ] `npm run build` + `cargo check`
```

---

## 14. เอกสารที่ต้องอัปเดตเมื่อ implement

| เอกสาร | เมื่อ |
|--------|-------|
| `docs/TESTING.md` | F-5 |
| `technical-guide/06-ui-ux.md` | F-5 |
| `technical-guide/03-frontend.md` | F-5 |
| `docs/specification.md` | F-5 |
| `CHANGELOG.md` | F-5 |
