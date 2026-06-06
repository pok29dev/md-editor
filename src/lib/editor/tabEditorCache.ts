import { EditorState, Transaction } from "@codemirror/state";
import { EditorView, type ViewUpdate } from "@codemirror/view";
import { buildEditorExtensions } from "./extensions";
import {
  editorSettingsKey,
  getEditorSettingsFromStore,
  type EditorSettings,
} from "./settings";

const tabViews = new Map<string, EditorView>();
const tabViewSettings = new Map<string, string>();

let onChangeHandler: (content: string) => void = () => {};
const updateHandlers = new Set<(update: ViewUpdate) => void>();

export function setTabEditorChangeHandler(handler: (content: string) => void) {
  onChangeHandler = handler;
}

export function subscribeTabEditorUpdate(
  handler: (update: ViewUpdate) => void,
): () => void {
  updateHandlers.add(handler);
  return () => updateHandlers.delete(handler);
}

function buildExtensions(isDark: boolean, settings: EditorSettings) {
  return [
    ...buildEditorExtensions(isDark, settings),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeHandler(update.state.doc.toString());
      }
      if (update.selectionSet || update.docChanged) {
        for (const handler of updateHandlers) {
          handler(update);
        }
      }
    }),
  ];
}

function measureView(view: EditorView) {
  requestAnimationFrame(() => {
    view.requestMeasure();
    requestAnimationFrame(() => view.requestMeasure());
  });
}

export function getTabEditorView(tabId: string): EditorView | undefined {
  return tabViews.get(tabId);
}

export function destroyTabEditorView(tabId: string) {
  const view = tabViews.get(tabId);
  if (!view) return;
  view.destroy();
  tabViews.delete(tabId);
  tabViewSettings.delete(tabId);
}

export function destroyOrphanTabEditors(activeTabIds: string[]) {
  const active = new Set(activeTabIds);
  for (const tabId of tabViews.keys()) {
    if (!active.has(tabId)) {
      destroyTabEditorView(tabId);
    }
  }
}

export function attachTabEditor(
  parent: HTMLElement,
  tabId: string,
  content: string,
  isDark: boolean,
  settings: EditorSettings = getEditorSettingsFromStore(),
): EditorView {
  for (const [id, view] of tabViews) {
    if (id !== tabId && view.dom.parentNode === parent) {
      view.dom.remove();
    }
  }

  const settingsKey = editorSettingsKey(isDark, settings);
  let view = tabViews.get(tabId);

  if (view && tabViewSettings.get(tabId) !== settingsKey) {
    destroyTabEditorView(tabId);
    view = undefined;
  }

  if (!view) {
    view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: buildExtensions(isDark, settings),
      }),
      parent,
    });
    tabViews.set(tabId, view);
    tabViewSettings.set(tabId, settingsKey);
    measureView(view);
    return view;
  }

  if (!view.dom.isConnected || view.dom.parentNode !== parent) {
    parent.replaceChildren(view.dom);
  }

  const current = view.state.doc.toString();
  if (current !== content) {
    view.dispatch({
      changes: { from: 0, to: current.length, insert: content },
      annotations: Transaction.addToHistory.of(false),
    });
  }

  measureView(view);
  return view;
}

export function recreateTabEditor(
  parent: HTMLElement,
  tabId: string,
  content: string,
  isDark: boolean,
  settings: EditorSettings = getEditorSettingsFromStore(),
): EditorView {
  destroyTabEditorView(tabId);
  return attachTabEditor(parent, tabId, content, isDark, settings);
}

export function syncTabEditorContent(
  tabId: string,
  content: string,
): boolean {
  const view = tabViews.get(tabId);
  if (!view) return false;

  const current = view.state.doc.toString();
  if (current === content) return true;
  if (content === "" && current.length > 0) return true;

  view.dispatch({
    changes: { from: 0, to: current.length, insert: content },
    annotations: Transaction.addToHistory.of(false),
  });
  return true;
}
