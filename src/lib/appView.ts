export type AppView = "editor" | "thclaws";

export function isEditorView(view: AppView): boolean {
  return view === "editor";
}

export function isThclawsView(view: AppView): boolean {
  return view === "thclaws";
}
