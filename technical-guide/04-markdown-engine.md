# 04 — Markdown Preview Engine

อ้างอิงการออกแบบจาก **Markdown-Viewer** — ใช้ marked.js เป็น parser หลัก

## 4.1 Pipeline Overview

```
content (string)
    │
    ├─ parseFrontmatter()          → YAML metadata table
    ├─ extractReferenceDefinitions() → ลบ [1]: url ออกจาก body
    │
    ├─ preprocessFootnotes()       → [^1] refs + footnote section
    │
    ├─ marked.parse()              → raw HTML
    │     ├─ extensions: blockMath, definitionList, sup/sub, highlight
    │     └─ code renderer: hljs + mermaid placeholder
    │
    ├─ sanitizeHtml()              → DOMPurify
    │
    └─ wrap <div class="markdown-body">
              │
              ▼ (usePreview — post-DOM)
    patchPreviewDom()
    enhanceGitHubAlerts()
    applyReferencePreviewLinks()
    renderMermaid()      [async]
    renderMathJax()      [async]
```

## 4.2 โมดูลหลัก

| ไฟล์ | หน้าที่ |
|------|--------|
| `renderCore.ts` | Parse หลัก → `RawRenderResult` (shared main + worker) |
| `renderer.ts` | Sanitize + wrap, finalize worker output |
| `extensions.ts` | marked config + custom tokenizers |
| `footnotes.ts` | Footnote extract + preprocess hook |
| `references.ts` | Reference link `[1]: url` |
| `alerts.ts` | GitHub Alerts post-DOM (`> [!NOTE]`) |
| `frontmatter.ts` | YAML `---` block |
| `sanitize.ts` | DOMPurify options |
| `mermaid.ts` | Mermaid init + run + theme reset |
| `mathjax.ts` | Lazy load offline MathJax |
| `exportHtml.ts` | Standalone HTML export |
| `segmented.ts` | Block splitting สำหรับ worker |
| `previewPatch.ts` | DOM patch, skeleton, scroll restore |
| `previewWorker.ts` | Web Worker entry |
| `previewWorkerClient.ts` | Worker lifecycle + thresholds |

## 4.3 marked Extensions

| Extension | Syntax | Output |
|-----------|--------|--------|
| `blockMath` | `$$...$$` | `<div class="math-block">` |
| `definitionList` | `term\n: definition` | `<dl><dt>...` |
| `superscript` | `x^2^` | `<sup>` |
| `subscript` | `H~2~O` | `<sub>` |
| `highlight` | `==text==` | `<mark>` |
| Footnotes (preprocess) | `[^1]` / `[^1]: text` | `<sup class="footnote-ref">` + section |
| Code (custom renderer) | ` ```lang ` | hljs หรือ mermaid container |

**marked options:** `gfm: true`, `breaks: true`

## 4.4 Mermaid

**Render path:**

1. Code block ` ```mermaid ` → `<div class="mermaid-container"><div class="mermaid" data-original-code="...">`
2. หลัง DOM commit → `renderMermaid(container, isDark)`
3. Reset node จาก `data-original-code`, ลบ `data-processed`
4. `mermaid.run({ nodes })`

**Config:** `securityLevel: "strict"`, `flowchart.useMaxWidth: true`, theme ตาม `resolvedTheme`

## 4.5 MathJax

- Script: `public/mathjax/tex-mml-chtml.js` (offline)
- โหลด lazy เมื่อ `hasMathContent()` เป็น true
- Delimiters: `$...$`, `$$...$$`, `\(...\)`, `\[...\]`
- `processEscapes: true`

## 4.6 GitHub Alerts

Markdown:

```markdown
> [!NOTE]
> ข้อความ
```

Flow: marked parse เป็น `<blockquote>` ธรรมดา → `enhanceGitHubAlerts()` แปลงเป็น `.markdown-alert-*` พร้อม SVG icon

รองรับ: NOTE, TIP, IMPORTANT, WARNING, CAUTION

## 4.7 Performance Optimizations

### Thresholds (`previewWorkerClient.ts`)

| Constant | ค่า | ผล |
|----------|-----|-----|
| Default debounce | 100 ms | เอกสารเล็ก |
| `LARGE_DOCUMENT_THRESHOLD` | 15,000 chars | debounce 160ms + idle defer |
| `HUGE_DOCUMENT_THRESHOLD` | 100,000 chars | debounce 240ms + skeleton |
| `PREVIEW_WORKER_THRESHOLD` | 50,000 chars | พิจารณา Web Worker |
| `PREVIEW_SEGMENT_MIN_BLOCKS` | 8 blocks | ขั้นต่ำสำหรับ segmented mode |
| `PREVIEW_WORKER_TIMEOUT` | 12,000 ms | Worker timeout |
| Block cache limit | 1,200 entries | Segment HTML cache |

### Web Worker

**เงื่อนไขใช้ worker (segmented mode):**

- Content ≥ 50KB
- ≥ 8 markdown blocks
- `isSegmentedPreviewSafe()` = true

**ไม่ใช้ segmented เมื่อมี:**

- YAML frontmatter
- Reference definitions `[1]: url`
- Footnotes `[^1]`
- Definition lists (`: term`)
- Raw HTML blocks

**Fallback:** worker fail 2 ครั้ง → disable worker, ใช้ main thread ถาวร

### Incremental DOM Patch

`patchPreviewDom()` ใน `previewPatch.ts`:

- เปรียบเทียบ child nodes ของ `.markdown-body`
- Reuse node ที่ `outerHTML` หรือ `data-preview-block-hash` ตรงกัน
- Full replace เมื่อ > 6,000 nodes หรือ first render
- Restore scroll position หลัง patch

### Skeleton UI

แสดง shimmer placeholder ระหว่าง render เอกสาร ≥15KB (ครั้งแรกหรือเปลี่ยน tab)

## 4.8 Export HTML

**ไฟล์:** `lib/markdown/exportHtml.ts`

- `buildStandaloneHtml(markdown, title)` → ไฟล์ HTML พร้อม minimal inline CSS
- **ข้อจำกัด:** ไม่ pre-render Mermaid SVG หรือ MathJax ในไฟล์ export

## 4.9 Syntax Support Matrix

| Feature | Status |
|---------|--------|
| GFM (headings, lists, tables, strikethrough) | ✅ |
| Task lists | ✅ |
| Syntax highlighting | ✅ |
| GitHub Alerts | ✅ |
| YAML frontmatter | ✅ |
| Footnotes | ✅ |
| Reference links | ✅ |
| Definition lists | ✅ |
| Superscript / subscript / highlight | ✅ |
| Mermaid | ✅ |
| LaTeX (MathJax) | ✅ |
| HTML blocks (sanitized) | ✅ |
| Emoji shortcodes | ❌ Post-MVP |
