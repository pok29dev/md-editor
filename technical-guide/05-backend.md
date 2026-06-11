# 05 — Backend (Tauri / Rust)

## 5.1 Entry Points

| ไฟล์ | บทบาท |
|------|--------|
| `src-tauri/src/main.rs` | Binary → `md_editor_lib::run()` |
| `src-tauri/src/lib.rs` | Tauri builder, register plugins + commands |

## 5.2 Plugins ที่ Register

```rust
tauri_plugin_dialog::init()
tauri_plugin_fs::init()
tauri_plugin_opener::init()
tauri_plugin_store::init()
```

## 5.3 IPC Commands

### File Operations — `commands/file.rs`

#### `scan_folder(path: String) -> FolderTree`

- Scan recursive จาก root path
- รวมเฉพาะไฟล์ `.md` และ `.markdown`
- แสดงโฟลเดอร์ที่มี markdown อยู่ภายใน (empty folders ถูก filter)
- เรียง alphabetically

**Return type:**

```rust
FolderTree {
    root: String,
    nodes: Vec<TreeNode>,
}

TreeNode {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<TreeNode>>,
}
```

#### `read_file(path: String) -> FileContent`

- อ่านไฟล์เป็น string
- Detect encoding: UTF-8 หรือ UTF-8-BOM
- Return `modified_at` (unix timestamp วินาที)

```rust
FileContent {
    content: String,
    encoding: String,      // "utf-8" | "utf-8-bom"
    modified_at: u64,
}
```

#### `write_file(path: String, content: String) -> ()`

- เขียนแบบ **atomic**: `{filename}.tmp` → rename
- ป้องกัน corruption ถ้า crash ระหว่าง write

### Preferences — `commands/preferences.rs`

**Storage:** `{app_config_dir}/preferences.json`

```rust
AppPreferences {
    color_scheme: String,                 // "light" | "dark" | "system"
    theme: String,                        // "default" | "blue" | "warm"
    sidebar_width: u32,                   // 180–400, default 240
    sidebar_collapsed: bool,
    sync_scroll: bool,
    default_view_mode: String,            // "split" | "editor" | "preview"
    restore_last_folder_on_startup: bool,
    editor_font_size: u32,                // 12–20, default 14
    preview_font_size: u32,               // 12–28, default 16 (display only)
    editor_tab_size: u32,                 // 2 | 4
    editor_line_numbers: bool,
    editor_line_wrap: bool,
    export_pdf_theme: String,             // "app" | "light" | "dark"
    export_pdf_page_size: String,         // "a4" | "letter"
    last_open_folder: Option<String>,
    recent_folders: Vec<String>,          // max 10
}
```

| Command | หน้าที่ |
|---------|--------|
| `get_preferences` | อ่าน JSON (default ถ้าไม่มี) |
| `save_preferences` | เขียน JSON |
| `add_recent_folder` | เพิ่ม recent, dedupe, max 10, set lastOpenFolder |

## 5.4 Capabilities

**ไฟล์:** `src-tauri/capabilities/default.json`

กำหนด permissions สำหรับ Tauri v2 (dialog, fs scope, etc.)

## 5.5 Window Configuration

**ไฟล์:** `src-tauri/tauri.conf.json`

| Setting | ค่า |
|---------|-----|
| Primary window label | `main` |
| Default size | 1280 × 800 |
| Min size | 800 × 500 |
| Title bar (macOS) | Overlay style |
| Dev URL | `http://localhost:1420` |
| Frontend dist | `../dist` |

### Multi-window workspaces

- หน้าต่างเพิ่มสร้างจาก frontend ผ่าน `WebviewWindow` (`src/lib/tauri/workspaceWindow.ts`) — URL `?workspace=new`
- แต่ละ webview มี Zustand state แยก (`rootFolder`, `tabs`, …); preferences ส่วน global (theme, font) ใช้ `preferences.json` ร่วมกัน
- `lastOpenFolder` อัปเดตจากหน้าต่าง `main` เท่านั้น (`add_recent_folder` + `buildPreferencesFromState`)
- เปิดไฟล์จาก OS (`open-file` event) ส่งไปหน้าต่างที่ focus (`src-tauri/src/lib.rs`)
- Capabilities: `windows: ["*"]`, `core:webview:allow-create-webview-window`

## 5.6 Frontend ↔ Rust Type Mapping

| Rust (`models/mod.rs`) | TypeScript (`types/files.ts`) |
|------------------------|-------------------------------|
| `TreeNode` | `TreeNode` |
| `FolderTree` | `FolderTree` |
| `FileContent` | `FileContent` |
| `AppPreferences` | `AppPreferences` |

**สำคัญ:** เมื่อแก้ Rust struct ต้อง sync TS interface ด้วย

## 5.7 Error Handling

- Rust commands return `Result<T, String>` — error message ส่งกลับ frontend
- Frontend แสดง error ใน sidebar (`fileTreeError`) หรือ console
- `read_file` / `write_file` errors จาก IO propagate เป็น string message
