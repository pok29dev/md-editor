# Spec — JSON & YAML File Support

> Status: **Released in v26.6.1901** · Branch: `feature/json-yaml-support`  
> Product: MD Editor (Tauri v2 + React) — Markdown-first, with structured data files as a secondary mode.

## 1. Goal

ให้แอป **เปิด แก้ไข และบันทึก** ไฟล์ `.json`, `.yaml`, `.yml` ได้ใน workflow เดียวกับ Markdown โดย:

- แสดงใน sidebar file tree ร่วมกับ `.md`
- ใช้ CodeMirror syntax highlighting ตามชนิดไฟล์
- ไม่พยายาม render Markdown preview สำหรับ data files
- ตรวจ syntax ก่อน save (พร้อมยืนยันถ้า invalid)

## 2. Non-goals (MVP)

- Visual tree/form editor
- JSON Schema validation
- JSONC (comments in JSON)
- YAML anchors / merge keys แบบ advanced
- เปลี่ยนชื่อ product จาก "MD Editor"
- Settings toggle ซ่อน/แสดง JSON/YAML ใน tree (Phase 5 — post-MVP)

## 3. Supported extensions

| Kind | Extensions | Editor language | Preview |
|------|------------|-----------------|---------|
| `markdown` | `.md`, `.markdown`, `.mdown`, `.mkd`, `.mdx` | Markdown | ✅ |
| `json` | `.json` | JSON | ❌ |
| `yaml` | `.yaml`, `.yml` | YAML | ❌ |

## 4. Architecture

### 4.1 File kind detection (frontend)

`src/lib/files/fileKind.ts`

```ts
type FileKind = "markdown" | "json" | "yaml";
detectFileKind(path: string): FileKind
isSupportedFilePath(path: string): boolean
supportsPreview(kind: FileKind): boolean
```

### 4.2 Backend scan (Rust)

`src-tauri/src/commands/file.rs` — รวม extension ใหม่ใน `scan_folder`  
โฟลเดอร์แสดงใน tree เมื่อมีไฟล์ supported อย่างน้อย 1 ไฟล์ภายใน (recursive)

`read_file` / `write_file` — ไม่เปลี่ยน (generic text อยู่แล้ว)

### 4.3 Tab model

```ts
interface EditorTab {
  // existing fields…
  fileKind: FileKind;
}
```

- กำหนด `fileKind` จาก path ตอน `openFileInTab` / `updateTabAfterSave`
- Data files เปิดด้วย `viewMode: "editor"` เสมอ
- `setViewMode` ปฏิเสธ `split` / `preview` เมื่อ `!supportsPreview(fileKind)`

### 4.4 Editor

- `@codemirror/lang-json`, `@codemirror/lang-yaml`
- `buildEditorExtensions(isDark, settings, fileKind)` เลือก language mode
- `editorSettingsKey` รวม `fileKind` (recreate editor เมื่อเปลี่ยน kind)
- ซ่อน `EditorToolbar` เมื่อ `fileKind !== "markdown"`

### 4.5 Preview

- `PreviewPane` แสดง empty state เมื่อ active tab เป็น data file
- `WindowTitleBar` disable ปุ่ม Split / Preview สำหรับ data file

### 4.6 Validation & format

`src/lib/files/validateStructured.ts`

| Function | Behavior |
|----------|----------|
| `validateJson(text)` | `JSON.parse` → `{ valid, message }` |
| `validateYaml(text)` | `js-yaml` load → `{ valid, message }` |
| `formatJson(text)` | `JSON.stringify(parsed, null, 2)` |
| `formatYaml(text)` | `js-yaml` dump, indent 2 |

- Status bar แสดง error message เมื่อ invalid (debounce ใน component)
- Save / Save As: ถ้า invalid → confirm dialog "Save anyway?"
- Shortcut `⌘⇧F` → Format Document (data files only)

## 5. UX flows

### Open folder

1. User opens folder with `README.md`, `package.json`, `config.yaml`
2. Tree แสดงทั้ง 3 ไฟล์
3. คลิก `package.json` → editor-only, JSON highlight, ไม่มี markdown toolbar

### Open file (⌘O)

Dialog filter: Markdown, JSON, YAML, All Files

### Save As

Filter ตาม `fileKind` ของ tab ปัจจุบัน (+ All Files)

### External open (double-click / drag)

รองรับ path ที่ `isSupportedFilePath` — ไม่จำกัดแค่ `.md`

## 6. Implementation phases

| Phase | Scope | Done when |
|-------|-------|-----------|
| **1** | Rust scan + `fileKind` + tree + open dialogs | JSON/YAML ปรากฏใน tree และเปิดได้ |
| **2** | CodeMirror JSON/YAML + hide markdown toolbar | Syntax highlight ถูกต้อง |
| **3** | View mode restrictions + preview empty state | ไม่ render MD preview สำหรับ data |
| **4** | Validate + format + save guard + status bar | Invalid syntax แจ้งเตือนก่อน save |
| **5** | Settings toggle, tree icons | Post-MVP |
| **6** | Docs + sample files + manual test checklist | Post-MVP |

## 7. Files to change (MVP)

| Area | Files |
|------|-------|
| Spec | `docs/spec-json-yaml.md` |
| Types | `src/lib/files/fileKind.ts`, `src/stores/appStore.ts` |
| Backend | `src-tauri/src/commands/file.rs` |
| Dialogs | `src/lib/tauri/dialogFilters.ts`, `commands.ts` |
| Hooks | `useFileTree.ts`, `useFileActions.ts`, `useKeyboardShortcuts.ts` |
| Editor | `extensions.ts`, `settings.ts`, `tabEditorCache.ts`, `MarkdownEditor.tsx`, `EditorPane.tsx` |
| UI | `PreviewPane.tsx`, `WindowTitleBar.tsx`, `StatusBar.tsx`, `Sidebar.tsx`, `AppShell.tsx` |
| Validation | `src/lib/files/validateStructured.ts` |
| Examples | `examples/sample-docs/config.json`, `config.yaml` |

## 8. Manual test checklist

- [ ] Open Folder → tree แสดง `.md`, `.json`, `.yaml`
- [ ] เปิด `config.json` → JSON highlight, ไม่มี MD toolbar
- [ ] เปิด `config.yaml` → YAML highlight
- [ ] Split/Preview disabled สำหรับ data file
- [ ] พิมพ์ JSON ผิด → status bar แสดง error
- [ ] ⌘⇧F → format JSON/YAML
- [ ] Save invalid → confirm dialog
- [ ] Save valid → บันทึกสำเร็จ
- [ ] ⌘O / double-click เปิด `.json` จาก Finder ได้
- [ ] Switch tab MD ↔ JSON → editor language เปลี่ยนถูกต้อง

## 9. Version

Released in **`26.6.1901`** (`v.26.6.1901`)
