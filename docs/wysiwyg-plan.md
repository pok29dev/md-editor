# MD Editor — WYSIWYG Mode Plan (Tiptap)

**Version:** 1.0  
**Last updated:** 2026-06-29  
**Status:** ✅ Shipped in `26.6.2901` (branch `feature/wysiwyg-tiptap`)  
**อ้างอิง:** [specification.md](./specification.md), [formatting-tools-plan.md](./formatting-tools-plan.md), [technical-guide/04-markdown-engine.md](../technical-guide/04-markdown-engine.md)

---

## 1. เป้าหมาย

เพิ่ม **โหมด WYSIWYG** ให้ md-editor — ผู้ใช้แก้ไข Markdown โดยเห็นผลจัดรูปแบบทันที (แบบ [MarkText](https://github.com/marktext/marktext)) โดยไม่ต้องมอง syntax delimiter (`**`, `#`, …) ตลอดเวลา

### หลักการออกแบบ

1. **Markdown string ยังเป็น source of truth** — บันทึกลงไฟล์เป็น `.md` เหมือนเดิม
2. **สลับโหมดได้** — WYSIWYG ↔ Source (CodeMirror) ↔ Split (editor + preview เดิม)
3. **JSON/YAML tabs ยังเป็น source-only** — ใช้ `fileKind` ที่มีอยู่
4. **Local-first** — ไม่พึ่ง cloud; paste image บันทึกลงดิสก์ผ่าน Tauri
5. **ค่อยๆ เพิ่ม parity** — เริ่มจาก GFM core ก่อน syntax พิเศษของ md-editor

### สิ่งที่ไม่ใช่เป้าหมาย (Phase แรก)

- ทำให้ preview pane (`marked` pipeline) เป็น `contenteditable`
- ทิ้ง CodeMirror — ยังต้องมี source mode
- รองรับ WYSIWYG สำหรับ JSON/YAML
- Clone MarkText/Muya ทุกฟีเจอร์ในครั้งเดียว

---

## 2. การตัดสินใจ: ทำไม Tiptap

เปรียบเทียบทางเลือกหลักก่อนเริ่ม implement:

| ทางเลือก | ข้อดี | ข้อเสีย | ผล |
|----------|-------|---------|-----|
| **Tiptap** (เลือก) | DX ดี, React integration, ProseMirror ecosystem, extensions หลากหลาย, markdown import/export | ต้อง map custom syntax เอง; bundle ใหญ่ขึ้น | ✅ |
| `@muyajs/core` (MarkText) | UX ใกล้ MarkText, GFM tests ในตัว | coupling สูง, dialect อาจไม่ตรง `marked`, maintenance ตาม upstream แยก | ❌ |
| สร้าง engine เอง | ควบคุม 100% | ใช้เวลาเป็นปี | ❌ |

### Packages ที่วางแผนใช้

| Package | บทบาท |
|---------|--------|
| `@tiptap/react` | React bindings + `useEditor` |
| `@tiptap/starter-kit` | Paragraph, heading, bold, italic, list, blockquote, code, hr |
| `@tiptap/extension-table` (+ row/cell/header) | ตาราง GFM |
| `@tiptap/extension-link` | ลิงก์ |
| `@tiptap/extension-image` | รูปภาพ |
| `@tiptap/extension-task-list` (+ task-item) | `- [ ]` checklist |
| `@tiptap/extension-placeholder` | placeholder ว่าง |
| `@tiptap/extension-underline` | underline (MarkText รองรับ) |
| `@tiptap/extension-code-block-lowlight` หรือ custom | code block + highlight |
| `tiptap-markdown` หรือ `@tiptap/pm` + custom serializer | Markdown ↔ ProseMirror round-trip |

> **หมายเหตุ:** ชื่อแพ็กเกจ markdown ของ Tiptap เปลี่ยนตามเวอร์ชัน — ตรวจสอบ compatibility กับ Tiptap v2 ตอน Phase 0 spike ก่อน lock version

---

## 3. สถาปัตยกรรมปัจจุบัน vs เป้าหมาย

### ปัจจุบัน (source-first)

```
CodeMirror ──onChange──► appStore.tabs[].content (string)
                                │
                                └──debounce──► marked ──► PreviewPane (read-only HTML)
```

### เป้าหมาย

```
                    ┌──────────────────────────────────┐
                    │         EditorAdapter            │
 tab.content ◄──────│  getContent() / setContent()     │──────► onChange
                    │  execFormat(cmd) / getSelection()│
                    └───────────┬──────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
     TiptapAdapter        CodeMirrorAdapter    (future)
     (wysiwyg mode)       (source mode)

Split mode: CodeMirror + PreviewPane (pipeline เดิม — ไม่เปลี่ยนใน Phase แรก)
```

**Source of truth:** `appStore.tabs[].content` ยังเป็น Markdown string  
**WYSIWYG:** แปลง string → ProseMirror doc ตอน mount; serialize กลับตอน change/blur/save

---

## 4. โหมดการมอง (View / Edit modes)

### ประเภทใหม่ที่เพิ่ม

```ts
// แยก "วิธีแก้" กับ "วิธีมอง"
export type EditMode = "wysiwyg" | "source";
export type ViewMode = "split" | "editor" | "preview"; // มีอยู่แล้ว
```

| ชื่อ UI | EditMode | ViewMode | คำอธิบาย |
|---------|----------|----------|----------|
| **WYSIWYG** | `wysiwyg` | `editor` | pane เดียว — Tiptap แสดงผลจัดรูปแบบ |
| **Source** | `source` | `editor` | pane เดียว — CodeMirror (พฤติกรรมเดิมของโหมด editor) |
| **Split** | `source` | `split` | CodeMirror + live preview (เดิม) |
| **Preview** | — | `preview` | ดู preview อย่างเดียว (เดิม) |

### กฎต่อ `fileKind`

| fileKind | WYSIWYG | Source | Split | Preview |
|----------|---------|--------|-------|---------|
| `markdown` | ✅ | ✅ | ✅ | ✅ |
| `json` / `yaml` | ❌ | ✅ | ❌ | ❌ |

### Keyboard shortcuts (ร่าง)

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| สลับ WYSIWYG ↔ Source | `⌘⌥S` | `Ctrl+Alt+S` |
| Split / Editor / Preview | `⌘⌥1/2/3` | `Ctrl+Alt+1/2/3` (มีอยู่แล้ว — ปรับให้สอดคล้อง) |

---

## 5. Markdown Dialect & Parity Matrix

md-editor ใช้ `marked` + custom extensions ใน `src/lib/markdown/extensions.ts`  
Tiptap serializer ต้อง **เขียน/ขยาย** ให้ output ใกล้เคียง pipeline เดิม

### Phase 2 (MVP) — ต้องรองรับ

| Syntax | Tiptap | หมายเหตุ |
|--------|--------|----------|
| Heading H1–H6 | StarterKit heading | |
| Bold / Italic / Strike | StarterKit | |
| Inline code | StarterKit | |
| Link | Link extension | |
| Image | Image extension | path local |
| Bullet / ordered list | StarterKit | |
| Blockquote | StarterKit | |
| Code block + language | CodeBlockLowlight | |
| Horizontal rule | StarterKit | |
| Hard break (GFM) | StarterKit / HardBreak | `breaks: true` ใน marked |

### Phase 3 — parity กับ preview

| Syntax | ความยาก | แนวทาง |
|--------|---------|--------|
| Table (GFM) | กลาง | Table extension + UI แก้ตาราง |
| Task list `- [ ]` | กลาง | TaskList + TaskItem |
| `==highlight==` | กลาง | Custom Mark extension |
| `^sup^` / `~sub~` | กลาง | Custom inline nodes/marks |
| Definition list | สูง | Custom block หรือ source fallback |
| Footnotes `[^1]` | สูง | Widget block + source fallback |
| GitHub alerts `> [!NOTE]` | กลาง | Custom callout node |
| Block math `$$...$$` | สูง | Atom node + MathJax render |
| Inline math `$...$` | สูง | Atom mark/node |
| Mermaid fenced block | สูง | Read-only widget; แก้ผ่าน source |
| YAML frontmatter | กลาง | Panel แยกเหนือ editor (ไม่ใช่ใน ProseMirror body) |

### Fallback policy

เมื่อ syntax ยังไม่รองรับใน WYSIWYG:

1. **Parse เป็น raw HTML block** หรือ **code block พิเศษ** ใน Tiptap (เก็บ markdown ต้นฉบับใน node attrs)
2. แสดง badge "แก้ใน Source mode"
3. ไม่ทำให้ serialize ทำลาย syntax ตอน save

---

## 6. Development Phases

### Phase 0 — Spike & toolchain (1 สัปดาห์)

**เป้าหมาย:** พิสูจน์ round-trip กับ Tiptap ก่อนแตะ production code

| Task | Output |
|------|--------|
| สร้าง `spike/tiptap-roundtrip/` (หรือ branch ย่อย) | POC แยก |
| ติดตั้ง Tiptap + markdown extension | `package.json` spike |
| ทดสอบ 10 ไฟล์จาก `examples/sample-docs/` | รายงาน diff |
| วัด bundle size impact | ตัวเลขก่อน/หลัง |
| Lock เวอร์ชัน packages | บันทึกในเอกสารนี้ §2 |

**เกณฑ์ผ่าน spike:**

- [ ] Bold/list/heading round-trip ไม่เสีย
- [ ] เปิดไฟล์จริง → แก้ → save → เปิดใน CodeMirror ได้เนื้อหาสมเหตุสมผล
- [ ] ไม่มี data loss กับ syntax ที่ยังไม่รองรับ (fallback ทำงาน)

---

### Phase 1 — EditorAdapter abstraction (2–3 สัปดาห์)

**เป้าหมาย:** UI ไม่ผูกกับ CodeMirror โดยตรง

#### ไฟล์ใหม่

```
src/lib/editor/
  adapter/
    types.ts              # EditorAdapter interface, FormatCommand
    codemirrorAdapter.ts  # wrap EditorView ปัจจุบัน
    index.ts
```

#### ไฟล์ที่แก้

| ไฟล์ | งาน |
|------|-----|
| `src/stores/appStore.ts` | เพิ่ม `editMode: EditMode` ต่อ tab หรือ global preference |
| `src/stores/editorStore.ts` | `activeAdapter` แทน `view: EditorView` เฉพาะ |
| `src/components/layout/EditorPane.tsx` | เลือก adapter ตาม `editMode` |
| `src/lib/editor/getEditorContent.ts` | อ่านผ่าน adapter |
| `src/lib/editor/formatActions.ts` | แยก `FormatCommand` enum + handler ต่อ adapter |
| `src/components/editor/EditorToolbar.tsx` | เรียก `adapter.execFormat()` |
| `src/hooks/useMarkdownFormat.ts` | refactor ให้ adapter-agnostic |

**Deliverable:** Source mode ทำงานเหมือนเดิม 100%; tests/manual QA ผ่าน

---

### Phase 2 — Tiptap WYSIWYG MVP (4–6 สัปดาห์)

**เป้าหมาย:** ใช้งาน WYSIWYG กับเอกสาร GFM พื้นฐานได้จริง

#### ไฟล์ใหม่

```
src/components/editor/
  TiptapEditor.tsx          # React wrapper, lifecycle ต่อ tab
  TiptapBubbleMenu.tsx    # format overlay (bold, italic, link, …)
src/lib/editor/
  adapter/tiptapAdapter.ts
  tiptap/
    extensions.ts           # รวม Tiptap extensions
    markdown.ts             # import/export helpers
    theme.css               # typography จาก preview variables
src/lib/editor/tiptapTabCache.ts   # cache editor instance ต่อ tab (คล้าย tabEditorCache)
```

#### UI

| Task | รายละเอียด |
|------|------------|
| ปุ่มสลับโหมด | Toolbar + View menu |
| Preference | Settings → Editor → default edit mode |
| Tab switch | destroy/recreate หรือ cache Tiptap instance ต่อ `tabId` |
| onChange | debounce → `updateTabContent()` (เช่น 150ms) |
| Save | serialize markdown จาก Tiptap ก่อน write file |

**Deliverable:**

- [x] โหมด WYSIWYG เปิดแท็บ `.md` ได้
- [x] สลับ WYSIWYG ↔ Source โดย content sync
- [x] Save / Save As ได้ markdown ถูกต้อง
- [x] Toolbar format actions ทำงานใน WYSIWYG (อย่างน้อย bold, heading, list, link)

---

### Phase 3 — Feature parity (4–8 สัปดาห์)

ตาม parity matrix §5 — ลำดับ: Table → Task list → Highlight → Frontmatter panel → Math/Mermaid widgets → Footnotes/alerts

**Deliverable:** เอกสารใน `examples/sample-docs/` ส่วนใหญ่เปิดใน WYSIWYG ได้โดยไม่เสีย syntax

---

### Phase 4 — MarkText-like UX (3–5 สัปดาห์)

| Feature | รายละเอียด |
|---------|------------|
| Bubble menu | เลือกข้อความ → bold/italic/link/strike |
| Slash commands `/` | แทรก heading, list, table, code block |
| Block handle | เปลี่ยนประเภทบล็อก (paragraph → heading) — **post-ship** |
| Focus mode | จางบรรทัดอื่น (`editorStore` + CSS) |
| Typewriter mode | scroll ให้ cursor อยู่กลาง |
| Paste image | Tauri: บันทึกไฟล์ในโฟลเดอร์ → แทรก `![](relative/path)` |
| Drag-drop image | เหมือน paste |

---

### Phase 5 — Integration & QA (2–4 สัปดาห์)

| Task | รายละเอียด |
|------|------------|
| Find & replace | รองรับ WYSIWYG (Tiptap search หรือ serialize ชั่วคราว) |
| Sync scroll | ใช้เฉพาะ split mode — ไม่กระทบ WYSIWYG |
| Export HTML/PDF | ยังใช้ `marked` pipeline จาก `tab.content` |
| Performance | เอกสาร >50KB — พิจารณา lazy mount / virtualize |
| Tests | round-trip unit tests + manual checklist |
| Docs | อัปเดต `specification.md`, `technical-guide/02-architecture.md` |

---

## 7. รายละเอียดทางเทคนิค

### 7.1 TiptapEditor lifecycle

```tsx
// แนวคิด — ไม่ใช่ implementation สุดท้าย
function TiptapEditor({ tabId, content, onChange }: Props) {
  const editor = useEditor({
    extensions: buildTiptapExtensions(),
    content: markdownToHtml(content), // หรือ direct markdown parse ตาม extension
    onUpdate: ({ editor }) => onChange(serializeMarkdown(editor)),
  }, [tabId]) // recreate เมื่อเปลี่ยน tab

  return <EditorContent editor={editor} className="tiptap-editor" />
}
```

**Cache ต่อ tab:** ใช้ pattern เดียวกับ `tabEditorCache.ts` — `Map<tabId, Editor>` เพื่อไม่สูญเสีย undo history เมื่อสลับแท็บ

### 7.2 Sync เมื่อสลับโหมด

```
WYSIWYG → Source:
  1. serialize Tiptap → markdown string
  2. updateTabContent(markdown)
  3. mount CodeMirror ด้วย content ล่าสุด

Source → WYSIWYG:
  1. อ่าน CodeMirror doc → string
  2. updateTabContent(string)
  3. mount Tiptap ด้วย parse(string)
```

ทำ sync **ก่อน** unmount adapter เสมอ — ป้องกัน race กับ debounced onChange

### 7.3 Styling

- ใช้ CSS variables จาก `src/styles/` (`--editor-font-size`, color scheme)
- Typography อ้างอิง `preview.css` / `github-markdown-css` ให้ WYSIWYG ใกล้ preview
- แยก `src/styles/tiptap.css` — ไม่ปนกับ CodeMirror theme

### 7.4 marked pipeline ที่มีอยู่

- **Split / Preview mode:** ยังใช้ `usePreview` + `marked` — ไม่รื้อ
- **Export HTML/PDF:** ยังอ่าน `tab.content` string
- **ระยะยาว:** พิจารณา shared AST หรือใช้ Tiptap เป็น canonical parser — นอกขอบเขต Phase 5

### 7.5 Bundle size

- Lazy-load Tiptap chunk เมื่อผู้ใช้เปิด WYSIWYG ครั้งแรก (`React.lazy`)
- Code-split แยกจาก CodeMirror bundle หลัก
- วัดด้วย `vite build --analyze` หลัง Phase 0

---

## 8. ความเสี่ยงและการลดความเสี่ยง

| ความเสี่ยง | ผลกระทบ | การลดความเสี่ยง |
|-----------|---------|----------------|
| Round-trip ไม่สมบูรณ์ | ไฟล์เสียหาย | Unit tests + spike ก่อน; เปรียบเทียบก่อน/หลัง save |
| Dialect ไม่ตรง marked | preview ≠ WYSIWYG | Parity matrix + fallback nodes |
| Bundle ใหญ่ขึ้น | แอปช้าลง | Lazy load; วัดใน Phase 0 |
| Toolbar/shortcut ซ้ำซ้อน | UX สับสน | `FormatCommand` เดียว หลาย adapter |
| Find/replace ใน WYSIWYG | ~~feature gap~~ ✅ `findReplace.ts` + FindReplace dialog |

---

## 9. เกณฑ์ยอมรับ (Acceptance)

### MVP (หลัง Phase 2)

1. เปิดไฟล์ `.md` ในโหมด WYSIWYG แก้ heading, bold, list, link ได้
2. สลับ Source ↔ WYSIWYG ไม่สูญเสียเนื้อหา (GFM พื้นฐาน)
3. Save แล้วเปิดไฟล์ใน editor อื่นได้ markdown ถูกต้อง
4. JSON/YAML tab ไม่แสดงตัวเลือก WYSIWYG
5. Split/Preview mode ทำงานเหมือนเดิม

### Full parity (หลัง Phase 3–5)

6. Table, task list, frontmatter ใช้งานได้ใน WYSIWYG
7. Math/Mermaid แสดงผลใน WYSIWYG (แก้ขั้นสูงผ่าน source ได้)
8. Bubble menu + paste image ทำงาน
9. Round-trip tests ผ่านสำหรับ `examples/sample-docs/`

---

## 10. ไฟล์อ้างอิงใน repo

| หัวข้อ | Path |
|--------|------|
| View mode ปัจจุบัน | `src/stores/appStore.ts` |
| CodeMirror editor | `src/components/editor/MarkdownEditor.tsx` |
| Tab editor cache | `src/lib/editor/tabEditorCache.ts` |
| Format actions | `src/lib/editor/formatActions.ts` |
| Preview pipeline | `src/lib/markdown/renderer.ts` |
| marked extensions | `src/lib/markdown/extensions.ts` |
| Layout | `src/components/layout/AppShell.tsx` |
| Sample docs | `examples/sample-docs/` |
| Spec (อัปเดตเมื่อ implement) | `docs/specification.md` |

---

## 11. Timeline โดยประมาณ

| Phase | ระยะเวลา (1 dev) | สถานะ |
|-------|------------------|--------|
| 0 — Spike | 1 สัปดาห์ | Planned |
| 1 — Adapter | 2–3 สัปดาห์ | Planned |
| 2 — MVP | 4–6 สัปดาห์ | Planned |
| 3 — Parity | 4–8 สัปดาห์ | Planned |
| 4 — UX | 3–5 สัปดาห์ | Planned |
| 5 — QA | 2–4 สัปดาห์ | Planned |

**รวม:** ~4–6 เดือน full parity · **MVP ใช้ได้จริง:** ~8–10 สัปดาห์หลังเริ่ม Phase 1

---

## 12. ขั้นตอนถัดไป

1. Review เอกสารนี้
2. เริ่ม **Phase 0 spike** บน branch `feature/wysiwyg-tiptap-spike`
3. อัปเดต `docs/specification.md` §1.4 เมื่อเริ่ม Phase 1
4. เพิ่ม `technical-guide/07-wysiwyg-tiptap.md` หลัง adapter layer เสร็จ

---

## Changelog

| วันที่ | การเปลี่ยนแปลง |
|--------|----------------|
| 2026-06-29 | สร้างเอกสาร v0.1 — เลือก Tiptap, แผน Phase 0–5 |
