use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TreeNode {
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub node_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<TreeNode>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderTree {
    pub root: String,
    pub nodes: Vec<TreeNode>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileContent {
    pub path: String,
    pub content: String,
    pub encoding: String,
    pub modified_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorSyntaxColorPalette {
    pub property: String,
    pub string: String,
    pub literal: String,
    pub keyword: String,
    pub comment: String,
    pub punctuation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorSyntaxCustomColors {
    pub light: EditorSyntaxColorPalette,
    pub dark: EditorSyntaxColorPalette,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiStructurePreferences {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default)]
    pub thclaws_path: String,
    #[serde(default = "default_true")]
    pub use_thclaws_defaults: bool,
    #[serde(default)]
    pub model: String,
    #[serde(default = "default_true")]
    pub run_rule_pass_first: bool,
    #[serde(default)]
    pub last_health_check_ok: bool,
    pub last_health_check_at: Option<u64>,
    pub last_health_check_message: Option<String>,
}

impl Default for AiStructurePreferences {
    fn default() -> Self {
        Self {
            enabled: false,
            thclaws_path: String::new(),
            use_thclaws_defaults: true,
            model: String::new(),
            run_rule_pass_first: true,
            last_health_check_ok: false,
            last_health_check_at: None,
            last_health_check_message: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppPreferences {
    #[serde(default = "default_color_scheme")]
    pub color_scheme: String,
    #[serde(default = "default_app_theme")]
    pub theme: String,
    #[serde(default = "default_sidebar_width")]
    pub sidebar_width: u32,
    #[serde(default)]
    pub sidebar_collapsed: bool,
    #[serde(default = "default_true")]
    pub sync_scroll: bool,
    #[serde(default = "default_view_mode")]
    pub default_view_mode: String,
    #[serde(default = "default_true")]
    pub restore_last_folder_on_startup: bool,
    #[serde(default = "default_folder_tree_expansion")]
    pub folder_tree_expansion: String,
    #[serde(default = "default_editor_font_size")]
    pub editor_font_size: u32,
    #[serde(default = "default_preview_font_size")]
    pub preview_font_size: u32,
    #[serde(default = "default_editor_tab_size")]
    pub editor_tab_size: u32,
    #[serde(default = "default_true")]
    pub editor_line_numbers: bool,
    #[serde(default = "default_true")]
    pub editor_line_wrap: bool,
    #[serde(default = "default_editor_syntax_colors")]
    pub editor_syntax_colors: String,
    #[serde(default = "default_editor_syntax_custom_colors")]
    pub editor_syntax_custom_colors: EditorSyntaxCustomColors,
    #[serde(default = "default_export_pdf_theme")]
    pub export_pdf_theme: String,
    #[serde(default = "default_export_pdf_page_size")]
    pub export_pdf_page_size: String,
    #[serde(default)]
    pub recent_folders: Vec<String>,
    pub last_open_folder: Option<String>,
    #[serde(default)]
    pub ai_structure: AiStructurePreferences,
}

fn default_color_scheme() -> String {
    "system".to_string()
}

fn default_app_theme() -> String {
    "default".to_string()
}

fn default_sidebar_width() -> u32 {
    240
}

fn default_true() -> bool {
    true
}

fn default_view_mode() -> String {
    "split".to_string()
}

fn default_folder_tree_expansion() -> String {
    "one_level".to_string()
}

fn default_editor_font_size() -> u32 {
    14
}

fn default_preview_font_size() -> u32 {
    16
}

fn default_editor_tab_size() -> u32 {
    2
}

fn default_editor_syntax_colors() -> String {
    "github".to_string()
}

fn default_syntax_palette_light() -> EditorSyntaxColorPalette {
    EditorSyntaxColorPalette {
        property: "#005cc5".to_string(),
        string: "#032f62".to_string(),
        literal: "#005cc5".to_string(),
        keyword: "#d73a49".to_string(),
        comment: "#6a737d".to_string(),
        punctuation: "#24292e".to_string(),
    }
}

fn default_syntax_palette_dark() -> EditorSyntaxColorPalette {
    EditorSyntaxColorPalette {
        property: "#79c0ff".to_string(),
        string: "#a5d6ff".to_string(),
        literal: "#79c0ff".to_string(),
        keyword: "#ff7b72".to_string(),
        comment: "#8b949e".to_string(),
        punctuation: "#c9d1d9".to_string(),
    }
}

fn default_editor_syntax_custom_colors() -> EditorSyntaxCustomColors {
    EditorSyntaxCustomColors {
        light: default_syntax_palette_light(),
        dark: default_syntax_palette_dark(),
    }
}

fn default_export_pdf_theme() -> String {
    "app".to_string()
}

fn default_export_pdf_page_size() -> String {
    "a4".to_string()
}

impl Default for AppPreferences {
    fn default() -> Self {
        Self {
            color_scheme: default_color_scheme(),
            theme: default_app_theme(),
            sidebar_width: default_sidebar_width(),
            sidebar_collapsed: false,
            sync_scroll: default_true(),
            default_view_mode: default_view_mode(),
            restore_last_folder_on_startup: default_true(),
            folder_tree_expansion: default_folder_tree_expansion(),
            editor_font_size: default_editor_font_size(),
            preview_font_size: default_preview_font_size(),
            editor_tab_size: default_editor_tab_size(),
            editor_line_numbers: default_true(),
            editor_line_wrap: default_true(),
            editor_syntax_colors: default_editor_syntax_colors(),
            editor_syntax_custom_colors: default_editor_syntax_custom_colors(),
            export_pdf_theme: default_export_pdf_theme(),
            export_pdf_page_size: default_export_pdf_page_size(),
            recent_folders: Vec::new(),
            last_open_folder: None,
            ai_structure: AiStructurePreferences::default(),
        }
    }
}
