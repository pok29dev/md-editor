# 03 — Frontend

## 3.1 Component Tree

```
App
└── AppShell
    ├── WindowTitleBar      (view mode, find, sync, overflow, color scheme, settings)
    ├── layout-title-row
    │   ├── SidebarTitleBar (folder name only)
    │   └── TabBar          (tabs, new tab, sidebar toggle)
    ├── layout-content-row
    │   ├── Sidebar
    │   │   ├── SidebarToolbar (open folder, expand/collapse all, refresh, hide)
    │   │   └── FileTree       (recursive, keyboard nav)
    ├── main-workspace
    │       ├── EditorPane → EditorToolbar (7 groups) + MarkdownEditor
    │       └── PreviewPane → PreviewFontControls + MarkdownPreview
    ├── StatusBar
    ├── FindReplace         (modal overlay)
    ├── LinkDialog          (modal overlay)
    └── SettingsModal
```

## 3.2 Layout Components

| Component | ไฟล์ | หน้าที่ |
|-----------|------|--------|
| `AppShell` | `components/layout/AppShell.tsx` | Root layout, เรียก hooks หลัก, จัด split panels |
| `WindowTitleBar` | `.../WindowTitleBar.tsx` | macOS overlay title bar + toolbar actions |
| `SidebarTitleBar` | `.../SidebarTitleBar.tsx` | ชื่อโฟลเดอร์ (แถวเดียวกับ Tab bar) |
| `SidebarToolbar` | `.../SidebarToolbar.tsx` | ปุ่ม open folder, expand/collapse all, refresh, hide sidebar |
| `Sidebar` | `.../Sidebar.tsx` | `SidebarToolbar` + file tree, loading/error/empty states |
| `FileTree` | `.../FileTree.tsx` | Tree recursive, keyboard nav, indent guides |
| `TabBar` | `.../TabBar.tsx` | Multi-tab, dirty indicator (`•`), close |
| `EditorPane` | `.../EditorPane.tsx` | Wrapper `EditorToolbar` + `MarkdownEditor` ของ active tab |
| `PreviewPane` | `.../PreviewPane.tsx` | Wrapper `MarkdownPreview` |
| `PreviewFontControls` | `.../PreviewFontControls.tsx` | ปรับขนาดฟอนต์ preview (`-` / scale / `+` / reset) |
| `StatusBar` | `.../StatusBar.tsx` | Path, word/char count, Modified/Saved |
| `ColorSchemeToggle` | `.../ColorSchemeToggle.tsx` | Cycle color scheme: system → light → dark |

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

- แถบ format อยู่เหนือ CodeMirror (~44px), scroll แนวนอนได้
- **7 กลุ่ม:** History, Heading, Inline, Alignment, Lists, Insert, Utilities
- **Icons:** Lucide ผ่าน `getFormatIcons()` ใน `lib/theme/icons.ts`
- Heading `<select>` Body + H1–6 sync กับบรรทัดที่ cursor
- Active state จาก `formatActiveState.ts`; Undo/Redo จาก editor history
- `mousedown` + `preventDefault` รักษา selection ขณะกดปุ่ม
- ดู mapping icon: [docs/editor-toolbar-lucide.md](../docs/editor-toolbar-lucide.md)

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
| `colorScheme` | `"light" \| "dark" \| "system"` |
| `resolvedColorScheme` | Color scheme ที่ apply จริง |
| `theme` | App theme: `"default" \| "blue" \| "warm"` |
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
| `useAppMenu` | `hooks/useAppMenu.ts` | Native macOS menu (File, Edit, Insert, Format, Window, Help) |
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

## 3.10 Icon System

| ชุด | ที่มา | ใช้กับ |
|-----|-------|--------|
| Lucide toolbar | `components/icons/lucide/toolbar.tsx` | Title bar, sidebar actions |
| Lucide format | `components/icons/lucide/format.tsx` | Editor toolbar |
| Lucide color scheme | `components/icons/lucide/colorScheme.tsx` | ColorSchemeToggle |
| Theme tree | `components/icons/themes/{default,blue,warm}/tree.tsx` | File tree (ตาม app theme) |
| Panel | `components/icons/PanelIcons.tsx` | Sidebar toggle |

Router: `lib/theme/icons.ts` — `getToolbarIcons`, `getFormatIcons`, `getColorSchemeIcons`, `getTreeIcons`

## 3.11 Styling

| ไฟล์ | บทบาท |
|------|--------|
| `styles/globals.css` | Reset, Tailwind, focus rings, reduced-motion |
| `styles/themes.css` | Import app theme layers |
| `styles/themes/{default,blue,warm}.css` | Tokens ต่อ color scheme + app theme |
| `styles/layout.css` | App shell, sidebar, tabs |
| `styles/preview.css` | Markdown preview, alerts, skeleton |
| `styles/editor-toolbar.css` | Formatting toolbar |
| `styles/titlebar.css` | macOS title bar overlay |
| `styles/dialogs.css` | Find, Link, shared modal styles |
| `styles/empty-states.css` | Sidebar, editor, preview empty states |
