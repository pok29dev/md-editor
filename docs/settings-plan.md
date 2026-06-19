# MD Editor — Settings Implementation Plan (MVP)

**Version:** 0.1  
**Last updated:** 2026-06-06  
**Status:** Phase S-7 complete — Settings MVP done  
**อ้างอิง:** [specification.md §5.7](./specification.md), [technical-guide/05-backend.md](../technical-guide/05-backend.md), [technical-guide/06-ui-ux.md](../technical-guide/06-ui-ux.md)

---

## 1. เป้าหมาย

เพิ่ม **Settings UI รวมศูนย์** สำหรับค่าที่จำเป็นของแอป โดย:

- ใช้ `AppPreferences` + `preferences.json` ที่มีอยู่แล้ว (Rust/Tauri)
- ไม่ทำ over-engineering — ทีละ phase ตาม MVP
- คง **quick toggles** ใน title bar (Theme, Sync) ได้ แต่ Settings เป็นจุดเดียวสำหรับค่า default และตัวเลือกที่ persist

---

## 2. สถานะปัจจุบัน (Baseline)

### 2.1 มีแล้ว

| ส่วน | รายละเอียด |
|------|------------|
| Backend | `get_preferences` / `save_preferences` → `{app_config_dir}/preferences.json` |
| Model | `AppPreferences` ใน Rust + `src/types/files.ts` |
| Auto-save | `usePersistPreferences` — debounce 300ms เมื่อ `theme`, `syncScroll`, `sidebarCollapsed` เปลี่ยน |
| Restore ตอนเปิดแอป | `restoreLastFolder()` โหลด theme, sidebar, syncScroll, lastOpenFolder |
| Quick UI | ThemeToggle, Sync toggle, View mode segmented control |

### 2.2 ยังไม่มี / ไม่ครบ

| ปัญหา | รายละเอียด |
|-------|------------|
| ไม่มี Settings UI | ค่าตั้งกระจายใน toolbar เท่านั้น |
| `sidebarWidth` hardcode | `persistPreferences()` เขียน `240` เสมอ |
| `defaultViewMode` | ไม่มีใน model — tab ใหม่ใช้ `"split"` ใน `createTab()` |
| `restoreLastFolder` | ไม่มี toggle ปิด/เปิด — restore เสมอถ้ามี path |
| Editor settings | font, tab size, line numbers — hardcode ใน `extensions.ts` / `theme.ts` |
| Export settings | PDF theme/margins — hardcode ใน `exportPdf.ts` |
| Keyboard shortcut | ไม่มี `Cmd+,` เปิด Settings (macOS convention) |

---

## 3. หลักการออกแบบ

### 3.1 Architecture

```
SettingsModal (UI)
    ↓ read/write
settingsStore หรือ appStore (settings slice)
    ↓ debounced
persistPreferences() → save_preferences (Tauri)
    ↓ startup
loadPreferences() → hydrate stores → apply side effects
```

**แนะนำ:** ขยาย `AppPreferences` เป็น� single source of truth ไม่สร้าง store แยกถ้าไม่จำเป็น — ใช้ `appStore` + helper `loadPreferences()` / `persistPreferences()` ที่มีอยู่

### 3.2 UX Pattern

- **Modal กลางจอ** (คล้าย FindReplace) — ไม่ต้อง route ใหม่
- **แท็บด้านซ้าย:** General | Editor | Files | Export
- **Apply ทันที** สำหรับ theme/sync (ไม่ต้องกด Save) — desktop app convention
- **Reset to defaults** ต่อ section (Phase สุดท้าย)

### 3.3 ขอบเขต MVP vs Post-MVP

| MVP Settings | Post-MVP |
|--------------|----------|
| Theme, sync scroll, sidebar | Custom preview CSS |
| Default view mode | Keyboard shortcut editor |
| Restore last folder | i18n / language |
| Sidebar width | File watcher toggle |
| Editor font size, tab size | Git integration prefs |
| PDF export basics | Performance tuning UI |

---

## 4. ขยาย Data Model

เพิ่มฟิลด์ใน `AppPreferences` (Rust + TypeScript sync):

```typescript
export interface AppPreferences {
  // --- existing ---
  theme: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  syncScroll: boolean;
  recentFolders: string[];
  lastOpenFolder: string | null;

  // --- Phase S-2: General ---
  defaultViewMode: "split" | "editor" | "preview";

  // --- Phase S-3: Files ---
  restoreLastFolderOnStartup: boolean;

  // --- Phase S-5: Editor ---
  editorFontSize: number;        // 12–20, default 14
  editorTabSize: number;         // 2 | 4, default 2
  editorLineNumbers: boolean;    // default true
  editorLineWrap: boolean;       // default true

  // --- Phase S-6: Export ---
  exportPdfTheme: "light" | "dark" | "app";  // default "app"
  exportPdfPageSize: "a4" | "letter";        // default "a4"
}
```

**Migration:** ใช้ `#[serde(default)]` ใน Rust และ default ใน TypeScript — ไฟล์เก่าโหลดได้โดยไม่ break

---

## 5. Implementation Phases

แต่ละ phase มี **Deliverable**, **ไฟล์หลัก**, และ **Verification** ชัดเจน — ทำครบ phase ก่อนค่อยเริ่ม phase ถัดไป

---

### Phase S-1: Settings Shell + Persist Foundation

**เป้าหมาย:** โครง Settings modal, เปิด/ปิดได้, persist รวมศูนย์

| Task | Priority | ไฟล์ |
|------|----------|------|
| สร้าง `SettingsModal.tsx` — layout แท็บ + ปุ่ม Close | P0 | `src/components/settings/` |
| เพิ่ม `settingsOpen` ใน store หรือ local state + `setSettingsOpen` | P0 | `editorStore` หรือ `appStore` |
| เมนู **md-editor → Settings…** + shortcut `Cmd+,` | P0 | `useAppMenu.ts`, `useKeyboardShortcuts.ts` |
| ปุ่ม ⚙ ใน title bar (optional) | P1 | `WindowTitleBar.tsx` |
| Refactor `persistPreferences()` — อ่าน/เขียนทุก field จาก store ไม่ hardcode | P0 | `lib/tauri/preferences.ts` |
| สร้าง `loadPreferences()` — hydrate store ตอน startup (แยกจาก `restoreLastFolder`) | P0 | `lib/tauri/preferences.ts`, `AppShell.tsx` |
| Placeholder content แต่ละแท็บ | P1 | `SettingsGeneral.tsx`, etc. |

**Deliverable:** กด `Cmd+,` → modal เปิด → ปิดได้ → preferences ยัง persist ค่าเดิม

**Verify:**
- [ ] Modal เปิดจาก menu และ keyboard
- [ ] ปิดด้วย Esc / ปุ่ม Close
- [ ] ไม่ regression การ restore theme/sync/sidebar ตอนเปิดแอป

**ประมาณ effort:** 1–2 วัน

---

### Phase S-2: General (Appearance & Workspace)

**เป้าหมาย:** ค่า UI หลักที่ user ต้องการตั้ง default

| Setting | UI Control | Apply |
|---------|------------|-------|
| Theme | Radio: System / Light / Dark | `setTheme()` + `data-theme` (มีอยู่แล้ว) |
| Sync scroll (default) | Toggle | `setSyncScroll()` |
| Sidebar collapsed (default) | Toggle | `setSidebarCollapsed()` |
| Default view mode | Select: Split / Editor / Preview | ใช้เมื่อ `createTab()` / `openFileInTab()` |

| Task | Priority | ไฟล์ |
|------|----------|------|
| เพิ่ม `defaultViewMode` ใน `AppPreferences` | P0 | `models/mod.rs`, `types/files.ts` |
| UI ใน `SettingsGeneral.tsx` | P0 | `components/settings/` |
| `createTab()` ใช้ `defaultViewMode` จาก prefs | P0 | `appStore.ts` |
| Persist + restore `defaultViewMode` | P0 | `preferences.ts`, `loadPreferences()` |
| ขยาย `usePersistPreferences` ให้ watch field ใหม่ | P0 | `usePersistPreferences.ts` |

**Deliverable:** ตั้ง default view mode เป็น Preview → tab ใหม่เปิดโหมde Preview

**Verify:**
- [ ] เปลี่ยน theme ใน Settings → UI เปลี่ยนทันที + รีสตาร์ทแล้วจำ
- [ ] Tab ใหม่ใช้ default view mode
- [ ] Title bar toggles ยัง sync กับค่าใน Settings

**ประมาณ effort:** 1 วัน

---

### Phase S-3: Files & Startup

**เป้าหมาย:** ควบคุมพฤติกรรม workspace ตอนเปิดแอป

| Setting | UI Control | Apply |
|---------|------------|-------|
| Restore last folder on startup | Toggle | `restoreLastFolder()` ข้ามถ้า off |
| Recent folders | Read-only list + Clear | `recentFolders` ใน prefs |
| (Optional) Max recent count | Number 5–20 | trim ตอน `add_recent_folder` |

| Task | Priority | ไฟล์ |
|------|----------|------|
| เพิ่ม `restoreLastFolderOnStartup` ใน model | P0 | Rust + TS types |
| UI ใน `SettingsFiles.tsx` | P0 | `components/settings/` |
| แก้ `restoreLastFolder` ให้เช็ค toggle | P0 | `useFileTree.ts` |
| ปุ่ม Clear recent folders | P1 | `SettingsFiles.tsx`, `savePreferences` |
| แสดง path ปัจจุบัน (read-only) | P2 | `SettingsFiles.tsx` |

**Deliverable:** ปิด restore → เปิดแอปใหม่ไม่โหลด folder เก่า

**Verify:**
- [ ] Toggle off → restart → ไม่ scan folder อัตโนมัติ
- [ ] Toggle on → restart → โหลด `lastOpenFolder` เหมือนเดิม
- [ ] Clear recent → list ว่าง + persist

**ประมาณ effort:** 1 วัน

---

### Phase S-4: Layout (Sidebar Width)

**เป้าหมาย:** ปิด gap spec §4.2 — sidebar ปรับความกว้างได้

| Setting | UI Control | Apply |
|---------|------------|-------|
| Sidebar width | Slider 180–400px (step 10) | CSS `--sidebar-width` |

| Task | Priority | ไฟล์ |
|------|----------|------|
| เก็บ `sidebarWidth` จริง (เลิก hardcode 240) | P0 | `preferences.ts` |
| เพิ่ม `sidebarWidth` ใน `appStore` | P0 | `appStore.ts` |
| Slider ใน `SettingsGeneral.tsx` หรือ `SettingsLayout.tsx` | P0 | `components/settings/` |
| Apply `--sidebar-width` ใน `layout.css` | P0 | `styles/layout.css`, `Sidebar.tsx` |
| Restore width ตอน startup | P0 | `loadPreferences()` |

**หมายเหตุ:** Drag-resize sidebar แบบ live เป็น **Post-MVP** — phase นี้ทำแค่ slider ใน Settings ก่อน

**Deliverable:** ปรับ slider → sidebar กว้าง/แคบ → restart แล้วจำ

**Verify:**
- [ ] ค่าอยู่ในช่วง 180–400
- [ ] Persist ถูกต้อง
- [ ] Collapse sidebar ยังทำงาน

**ประมาณ effort:** 1–2 วัน

---

### Phase S-5: Editor

**เป้าหมาย:** ปรับประสบการณ์เขียนโค้ดพื้นฐาน

| Setting | UI Control | Default | Apply |
|---------|------------|---------|-------|
| Font size | Slider 12–20 | 14 | CodeMirror theme / `.cm-scroller` |
| Tab size | Select 2 / 4 | 2 | `indentUnit.of()` |
| Line numbers | Toggle | on | `lineNumbers()` extension |
| Line wrap | Toggle | on | `EditorView.lineWrapping` |

| Task | Priority | ไฟล์ |
|------|----------|------|
| เพิ่ม editor fields ใน `AppPreferences` | P0 | Rust + TS |
| UI ใน `SettingsEditor.tsx` | P0 | `components/settings/` |
| Refactor `buildEditorExtensions(isDark, settings)` | P0 | `lib/editor/extensions.ts` |
| Recreate / reconfigure editor เมื่อ settings เปลี่ยน | P0 | `MarkdownEditor.tsx`, `tabEditorCache.ts` |
| Persist + restore | P0 | preferences layer |

**Deliverable:** เปลี่ยน font size ใน Settings → editor อัปเดตทันที

**Verify:**
- [ ] Tab size เปลี่ยน indent ของ Tab key
- [ ] ปิด line numbers → gutter หาย
- [ ] ปิด line wrap → horizontal scroll
- [ ] สลับ tab แล้ว settings เหมือนกันทุก tab

**ประมาณ effort:** 2 วัน

---

### Phase S-6: Export (PDF)

**เป้าหมาย:** ตัวเลือก export ที่จำเป็นหลังมี PDF

| Setting | UI Control | Default | Apply |
|---------|------------|---------|-------|
| PDF theme | Select: App / Light / Dark | App | `buildPdfBytes({ isDark })` |
| PDF page size | Select: A4 / Letter | A4 | jsPDF `format` |

| Task | Priority | ไฟล์ |
|------|----------|------|
| เพิ่ม export fields ใน model | P0 | Rust + TS |
| UI ใน `SettingsExport.tsx` | P0 | `components/settings/` |
| ส่ง prefs เข้า `exportPdf()` / `buildPdfBytes()` | P0 | `useFileActions.ts`, `exportPdf.ts` |
| (Optional) PDF margins slider | P2 | `exportPdf.ts` |

**Deliverable:** ตั้ง PDF เป็น Letter + Light → export ได้ตามที่ตั้ง

**Verify:**
- [ ] Theme "App" ใช้ `resolvedTheme` ปัจจุบัน
- [ ] Page size ส่งผลกับ jsPDF
- [ ] HTML export ไม่กระทบ (หรือเพิ่ม toggle ใน phase ถัดไป)

**ประมาณ effort:** 1 วัน

---

### Phase S-7: Polish & QA (Settings MVP Complete)

**เป้าหมาย:** ปิดงาน Settings MVP

| Task | Priority |
|------|----------|
| Reset section to defaults | P1 |
| Focus trap + a11y ใน modal | P1 |
| อัปเดต `docs/TESTING.md` — checklist Settings | P0 |
| อัปเดต `technical-guide/06-ui-ux.md` § Settings | P0 |
| อัปเดต `CHANGELOG.md` | P1 |
| Bump `src/version.ts` | P1 |

**Verify (รวม):**
- [ ] ทุก setting persist หลัง restart
- [ ] ไม่มี field orphan ใน JSON
- [ ] Settings เปิดได้ใน Tauri dev + production build
- [ ] Regression: save, export, tab switch, preview

**ประมาณ effort:** 1 วัน

---

## 6. Timeline สรุป

| Phase | ชื่อ | Effort | Dependency |
|-------|------|--------|------------|
| **S-1** | Settings shell + persist | 1–2 วัน | — |
| **S-2** | General | 1 วัน | S-1 |
| **S-3** | Files & startup | 1 วัน | S-1 |
| **S-4** | Sidebar width | 1–2 วัน | S-1 |
| **S-5** | Editor | 2 วัน | S-1 |
| **S-6** | Export PDF | 1 วัน | S-1, PDF export |
| **S-7** | Polish & QA | 1 วัน | S-2–S-6 |

**รวมประมาณ:** 8–10 วัน (part-time) หรือ 4–5 วัน (full-time)

**ลำดับแนะนำ:** S-1 → S-2 → S-3 → S-4 → (S-5 ข parallel S-6) → S-7

---

## 7. โครงสร้างไฟล์ใหม่ (เมื่อ implement ครบ)

```
src/
├── components/
│   └── settings/
│       ├── SettingsModal.tsx      # shell + tab nav
│       ├── SettingsGeneral.tsx    # S-2, S-4
│       ├── SettingsEditor.tsx     # S-5
│       ├── SettingsFiles.tsx      # S-3
│       └── SettingsExport.tsx     # S-6
├── hooks/
│   └── usePreferences.ts          # load, persist, apply (optional refactor)
└── lib/tauri/
    └── preferences.ts             # ขยาย load + persist
```

---

## 8. Acceptance Criteria (Settings MVP)

1. เปิด Settings ได้จาก **menu** และ **`Cmd+,`**
2. ค่าใน Settings **persist** ใน `preferences.json` และ **restore** ตอนเปิดแอป
3. ครบ 4 กลุ่ม: **General, Editor, Files, Export**
4. ไม่ break workflow หลัก: open folder, edit, preview, save, export
5. เอกสาร TESTING + technical-guide อัปเดต

---

## 9. Out of Scope (ยืนยันไม่ทำใน Settings MVP)

- Keyboard shortcut customization
- Custom preview CSS / themes
- Per-tab settings (ยกเว้น view mode ที่มีอยู่แล้ว)
- Cloud sync / account
- i18n

---

## 10. Checklist สำหรับ implement แต่ละ Phase

Copy ไปใช้ใน PR / issue:

```markdown
### Phase S-X

- [ ] อัปเดต `AppPreferences` (Rust + TS)
- [ ] UI component
- [ ] Wire store + persist
- [ ] Restore ตอน startup
- [ ] Manual test ตาม Verify
- [ ] ไม่ regression build (`npm run build`, `cargo check`)
```

---

## 11. เอกสารที่ต้องอัปเดตเมื่อ implement

| เอกสาร | เมื่อ |
|--------|-------|
| `docs/TESTING.md` | S-7 |
| `technical-guide/06-ui-ux.md` | S-7 — เพิ่ม § Settings |
| `technical-guide/05-backend.md` | S-1 — ขยาย AppPreferences |
| `technical-guide/07-api-reference.md` | S-1 — ถ้ามี command ใหม่ |
| `docs/specification.md` | S-7 — อัปเดต §5.7 ถ้าจำเป็น |
| `CHANGELOG.md` | แต่ละ phase merge หรือรวม S-7 |
