# 03 — Frontend

## 3.1 Component Tree

```
App
└── AppShell
    ├── WindowTitleBar      (view mode, find, sync, export, theme)
    ├── layout-title-row
    │   ├── SidebarTitleBar (folder name, refresh, collapse)
    │   └── TabBar          (tabs, new tab, sidebar toggle)
    ├── layout-content-row
    │   ├── Sidebar
    │   │   └── FileTree    (recursive)
    ├── main-workspace
    │       ├── EditorPane → EditorToolbar + MarkdownEditor
    │       └── PreviewPane → MarkdownPreview
    ├── StatusBar
    ├── FindReplace         (modal overlay)
    └── LinkDialog          (modal overlay)
```

## 3.2 Layout Components

| Component | ไฟล์ | หน้าที่ |
|-----------|------|--------|
| `AppShell` | `components/layout/AppShell.tsx` | Root layout, เรียก hooks หลัก, จัด split panels |
| `WindowTitleBar` | `.../WindowTitleBar.tsx` | macOS overlay title bar + toolbar actions |
| `SidebarTitleBar` | `.../SidebarTitleBar.tsx` | ชื่อโฟลเดอร์, refresh tree |
| `Sidebar` | `.../Sidebar.tsx` | Container file tree, loading/error states |
| `FileTree` | `.../FileTree.tsx` | Tree แบบ recursive, highlight active file |
| `TabBar` | `.../TabBar.tsx` | Multi-tab, dirty indicator (`•`), close |
| `EditorPane` | `.../EditorPane.tsx` | Wrapper `EditorToolbar` + `MarkdownEditor` ของ active tab |
| `PreviewPane` | `.../PreviewPane.tsx` | Wrapper `MarkdownPreview` |
| `StatusBar` | `.../StatusBar.tsx` | Path, word/char count, Modified/Saved |
| `ThemeToggle` | `.../ThemeToggle.tsx` | Cycle system → light → dark |

## 3.3 Editor Components

### MarkdownEditor

**ไฟล์:** `components/editor/MarkdownEditor.tsx`

- สร้าง `EditorView` ใหม่เมื่อ `resolvedTheme` เปลี่ยน
- `key={activeTab.id}` ใน EditorPane — remount เมื่อเปลี่ยน tab
- Sync content: store → editor (skip ถ้า store stale หลัง save)
- Register `view` ใน `editorStore` สำหรับ Find/Save/Sync scroll

### FindReplace

**ไฟล์:** `components/editor/FindReplace.tsx`

- Modal overlay (`z-index: 1000`)
- ใช้ `@codemirror/search`: find, replace, replace all
- เปิดด้วย `Cmd/Ctrl+F` หรือปุ่มใน title bar

### EditorToolbar

**ไฟล์:** `components/editor/EditorToolbar.tsx`, `styles/editor-toolbar.css`

- แถบ format อยู่เหนือ CodeMirror ใน editor column
- Heading `<select>` sync กับบรรทัดที่ cursor (`headingLevel.ts`, `useEditorToolbarState`)
- ปุ่ม inline/list แสดง active state จาก `formatActiveState.ts`
- `mousedown` + `preventDefault` รักษา selection ขณะกดปุ่ม

### LinkDialog

**ไฟล์:** `components/editor/LinkDialog.tsx`

- Modal ใส่ URL + label สำหรับ Markdown link
- เปิดจาก toolbar, menu **Markdown Link**, หรือ `Cmd/Ctrl+K`
- Submit เรียก `applyFormatAction("linkPrompt", { url, linkText })`

## 3.4 Format Actions

**ไฟล์:** `lib/editor/formatActions.ts`, `hooks/useMarkdownFormat.ts`

| Module | หน้าที่ |
|--------|--------|
| `formatActions.ts` | Core: wrap, line prefix, blocks, toggle unwrap, `applyFormatAction()` |
| `formatActiveState.ts` | ตรวจว่า cursor/selection อยู่ใน wrap หรือ list prefix |
| `headingLevel.ts` | อ่าน heading level ของบรรทัดที่ cursor |
| `formatShortcuts.ts` | Guard — shortcut format ทำงานเฉพาะเมื่อ editor focused |
| `useMarkdownFormat.ts` | Bridge toolbar/menu → `applyFormatAction` |
| `useEditorToolbarState.ts` | Sync heading + active state กับ cursor |
| `useFormatMenuActions.ts` | Bridge native menu → format actions |

**Toggle wrap:** cursor ในคำว่าง → ขยายเป็นคำก่อน wrap; กดซ้ำถอด delimiter (`**`, `*`, etc.)

## 3.5 Preview Components

### MarkdownPreview

**ไฟล์:** `components/preview/MarkdownPreview.tsx`

- ไม่ใช้ `dangerouslySetInnerHTML` — DOM จัดการโดย `usePreview` ผ่าน `patchPreviewDom`
- Register `previewScrollEl` ใน `editorStore` สำหรับ sync scroll
- Attributes: `aria-busy`, `data-render-state`

## 3.6 Zustand Stores

### appStore — `stores/appStore.ts`

**State:**

```typescript
interface EditorTab {
  id: string;
  path: string;
  title: string;
  content: string;
  isDirty: boolean;
  viewMode: "split" | "editor" | "preview";
}
```

| Field | คำอธิบาย |
|-------|----------|
| `theme` | `"light" \| "dark" \| "system"` |
| `resolvedTheme` | Theme ที่ apply จริง |
| `sidebarCollapsed` | ซ่อน sidebar |
| `syncScroll` | เปิด sync scroll editor ↔ preview |
| `tabs` / `activeTabId` | Multi-tab state |
| `rootFolder` | Path โฟลเดอร์ที่เปิด |
| `fileTree` | `TreeNode[]` จาก Rust |
| `expandedPaths` | สถานะ expand ของแต่ละโฟลเดอร์ |

**Actions สำคัญ:**

| Action | หน้าที่ |
|--------|--------|
| `openFileInTab` | เปิดหรือ switch ไป tab ที่มี path อยู่แล้ว |
| `updateTabContent` | อัปเดต content + set `isDirty: true` |
| `markTabSaved` | Clear dirty flag |
| `setViewMode` | เปลี่ยน view mode ของ **active tab** |
| `findTabByPath` | หา tab จาก path (normalize ด้วย `lib/paths.ts`) |

### editorStore — `stores/editorStore.ts`

| Field | คำอธิบาย |
|-------|----------|
| `view` | CodeMirror `EditorView` instance ปัจจุบัน |
| `previewScrollEl` | Scroll container ของ preview pane |
| `findReplaceOpen` | สถานะ Find modal |
| `linkDialogOpen` | สถานะ Link dialog |

## 3.7 Hooks

| Hook | ไฟล์ | หน้าที่ |
|------|------|--------|
| `usePreview` | `hooks/usePreview.ts` | Debounce, worker, DOM patch, Mermaid/MathJax |
| `useFileTree` | `hooks/useFileTree.ts` | Open folder/file, refresh, restore last folder |
| `useFileActions` | `hooks/useFileActions.ts` | Save, Save As, Export HTML |
| `useTabActions` | `hooks/useTabActions.ts` | Close tab + unsaved warning |
| `useSyncScroll` | `hooks/useSyncScroll.ts` | Bidirectional scroll ratio sync |
| `useKeyboardShortcuts` | `hooks/useKeyboardShortcuts.ts` | Global shortcuts, format shortcuts, quit confirmation |
| `useAppMenu` | `hooks/useAppMenu.ts` | Native macOS menu (Format + Insert) |
| `useMarkdownFormat` | `hooks/useMarkdownFormat.ts` | Toolbar format actions |
| `useEditorToolbarState` | `hooks/useEditorToolbarState.ts` | Heading + active toolbar state |
| `useFormatMenuActions` | `hooks/useFormatMenuActions.ts` | Menu → format actions |
| `usePersistPreferences` | `hooks/usePersistPreferences.ts` | Debounced persist theme/sync/sidebar |
| `useActiveViewMode` | `hooks/useActiveViewMode.ts` | Derive `viewMode` จาก active tab |

## 3.8 CodeMirror Setup

**ไฟล์:** `lib/editor/extensions.ts`, `lib/editor/theme.ts`

| Extension | แหล่ง |
|-----------|-------|
| Line numbers | `@codemirror/view` |
| Active line highlight | `@codemirror/view` |
| Bracket matching | `@codemirror/language` |
| Syntax highlighting | Custom: heading = **bold only** (ไม่มี underline) |
| Selection match highlight | `@codemirror/search` |
| History (undo/redo) | `@codemirror/commands` |
| Markdown language | `@codemirror/lang-markdown` |
| Line wrapping | `EditorView.lineWrapping` |
| Theme | CSS variables via `createEditorTheme(isDark)` |

**Keymaps:**

| Key | Action |
|-----|--------|
| `Mod-f` | Open Find |
| `Tab` | Indent (2 spaces) |
| Default + history keymaps | Undo/redo, etc. |

## 3.9 Tauri Frontend Layer

**ไฟล์:** `lib/tauri/commands.ts`, `lib/tauri/preferences.ts`, `lib/tauri/dialogFilters.ts`

- `pickFolder`, `pickOpenMarkdown`, `pickSaveMarkdown`, `pickSaveHtml`
- Wrappers สำหรับ `invoke()` ทุก Rust command
- `refreshTree.ts` — re-scan folder หลัง save ภายนอก

## 3.10 Styling

| ไฟล์ | บทบาท |
|------|--------|
| `styles/globals.css` | Reset, Tailwind import |
| `styles/themes.css` | CSS variables light/dark |
| `styles/layout.css` | App shell, sidebar, tabs |
| `styles/preview.css` | Markdown preview, alerts, skeleton |
| `styles/editor-toolbar.css` | Formatting toolbar |
| `styles/titlebar.css` | macOS title bar overlay |
