import { useCallback, useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { message } from "@tauri-apps/plugin-dialog";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "../../stores/appStore";
import {
  AI_STRUCTURE_MODEL_EXAMPLES,
  THCLAWS_INSTALL_URL,
} from "../../lib/aiStructure/settings";
import {
  detectThclaws,
  openThclawsProjectConfigDir,
  openThclawsUserConfigDir,
  openThclawsWorkspaceDir,
  testThclawsConnection,
} from "../../lib/tauri/commands";
import {
  flushPersistPreferences,
  resetAiStructureSettings,
} from "../../lib/tauri/preferences";
import { SettingsResetButton } from "./SettingsResetButton";

export function SettingsAiStructure() {
  const aiStructure = useAppStore((s) => s.aiStructure);
  const rootFolder = useAppStore((s) => s.rootFolder);
  const setAiStructure = useAppStore((s) => s.setAiStructure);
  const [detectMessage, setDetectMessage] = useState<string | null>(null);
  const [detectVersion, setDetectVersion] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const useDefaults = aiStructure.useThclawsDefaults;
  const canTest =
    !!rootFolder &&
    !testing &&
    (useDefaults || aiStructure.model.trim().length > 0);

  const handleOpenWorkspace = async () => {
    if (!rootFolder) {
      await message("Open a folder in the sidebar first.", {
        title: "Open thClaws Workspace",
        kind: "warning",
      });
      return;
    }
    try {
      await openThclawsWorkspaceDir(rootFolder);
    } catch (err) {
      await message(String(err), {
        title: "Open thClaws Workspace",
        kind: "error",
      });
    }
  };

  const handleOpenProjectConfig = async () => {
    if (!rootFolder) {
      await message("Open a folder in the sidebar first.", {
        title: "Open Project .thclaws",
        kind: "warning",
      });
      return;
    }
    try {
      await openThclawsProjectConfigDir(rootFolder);
    } catch (err) {
      await message(String(err), {
        title: "Open Project .thclaws",
        kind: "error",
      });
    }
  };

  const handleOpenUserConfig = async () => {
    try {
      await openThclawsUserConfigDir();
    } catch (err) {
      await message(String(err), {
        title: "Open thClaws User Config",
        kind: "error",
      });
    }
  };

  const runDetect = useCallback(async () => {
    const result = await detectThclaws(aiStructure.thclawsPath || undefined);
    setDetectMessage(result.message);
    setDetectVersion(result.version);
    if (result.found && result.path && !aiStructure.thclawsPath) {
      setAiStructure({ thclawsPath: result.path });
    }
    void flushPersistPreferences();
  }, [aiStructure.thclawsPath, setAiStructure]);

  useEffect(() => {
    void runDetect();
  }, [runDetect]);

  const handleTest = async () => {
    if (!rootFolder) {
      await message("Open a folder before testing thClaws.", {
        title: "AI Structure",
        kind: "warning",
      });
      return;
    }
    setTesting(true);
    try {
      const result = await testThclawsConnection(
        rootFolder,
        aiStructure.thclawsPath || undefined,
        aiStructure.useThclawsDefaults,
        aiStructure.model,
      );
      setAiStructure({
        lastHealthCheckOk: result.ok,
        lastHealthCheckAt: Date.now(),
        lastHealthCheckMessage: result.message,
        enabled: result.ok ? true : aiStructure.enabled,
      });
      void flushPersistPreferences();
    } finally {
      setTesting(false);
    }
  };

  const browseBinary = async () => {
    const selected = await openDialog({
      multiple: false,
      directory: false,
      title: "Select thClaws binary",
    });
    if (selected && !Array.isArray(selected)) {
      setAiStructure({
        thclawsPath: selected,
        lastHealthCheckOk: false,
        lastHealthCheckMessage: null,
      });
      void flushPersistPreferences();
    }
  };

  const statusLabel = aiStructure.lastHealthCheckOk
    ? "Ready"
    : detectMessage && detectMessage.includes("not found")
      ? "thClaws not installed"
      : "Setup required";

  return (
    <section className="settings-section">
      <h3 className="settings-section-title">AI Structure</h3>
      <p className="settings-section-desc">
        md-editor calls thClaws one-shot mode to restructure text. It only passes{" "}
        <code>--model</code> when you pick a model below — it never reads or writes
        thClaws config files.
      </p>

      <div className="ai-setup-status" data-ready={aiStructure.lastHealthCheckOk}>
        <strong>{statusLabel}</strong>
        {detectVersion ? <span>{detectVersion}</span> : null}
        {aiStructure.lastHealthCheckMessage ? (
          <p className="settings-field-desc">{aiStructure.lastHealthCheckMessage}</p>
        ) : detectMessage ? (
          <p className="settings-field-desc">{detectMessage}</p>
        ) : null}
      </div>

      <fieldset className="settings-field">
        <legend className="settings-label">Model for AI Structure</legend>
        <label className="settings-toggle">
          <input
            type="radio"
            name="ai-model-source"
            checked={useDefaults}
            onChange={() => {
              setAiStructure({
                useThclawsDefaults: true,
                lastHealthCheckOk: false,
                lastHealthCheckMessage: null,
              });
              void flushPersistPreferences();
            }}
          />
          Use thClaws default model on this machine
        </label>
        <p className="settings-field-desc">
          Do not send <code>--model</code>. thClaws uses whatever model is already
          configured in your thClaws install.
        </p>
        <label className="settings-toggle">
          <input
            type="radio"
            name="ai-model-source"
            checked={!useDefaults}
            onChange={() => {
              setAiStructure({
                useThclawsDefaults: false,
                lastHealthCheckOk: false,
                lastHealthCheckMessage: null,
              });
              void flushPersistPreferences();
            }}
          />
          Specify model for this app
        </label>
        {!useDefaults ? (
          <>
            <label className="settings-label" htmlFor="ai-model">
              Model name (<code>--model</code>)
            </label>
            <input
              id="ai-model"
              className="settings-text-input"
              value={aiStructure.model}
              placeholder="e.g. claude-sonnet-4-6"
              onChange={(event) => {
                setAiStructure({
                  model: event.target.value,
                  lastHealthCheckOk: false,
                  lastHealthCheckMessage: null,
                });
                void flushPersistPreferences();
              }}
            />
            <p className="settings-field-desc">
              Examples: {AI_STRUCTURE_MODEL_EXAMPLES.join(", ")}. Use a provider prefix
              when needed (e.g. <code>dashscope/qwen-max</code>, not bare{" "}
              <code>qwen-5.2</code>).
            </p>
          </>
        ) : null}
      </fieldset>

      <fieldset className="settings-field">
        <legend className="settings-label">thClaws CLI</legend>
        <p className="settings-field-desc">
          md-editor runs thClaws from the folder open in the sidebar. Project
          settings live in <code>.thclaws/</code> under that folder. Global API
          keys stay in thClaws user config.
        </p>
        <p className="settings-field-desc">
          Workspace:{" "}
          <code>{rootFolder ?? "No folder open — open a folder first"}</code>
        </p>
        <div className="settings-row">
          <button type="button" className="settings-action-btn" onClick={() => void runDetect()}>
            Detect thClaws
          </button>
          <button type="button" className="settings-action-btn" onClick={() => void browseBinary()}>
            Browse…
          </button>
          <button
            type="button"
            className="settings-action-btn"
            onClick={() => void openUrl(THCLAWS_INSTALL_URL)}
          >
            Install guide
          </button>
          <button
            type="button"
            className="settings-action-btn"
            onClick={() => void handleOpenWorkspace()}
          >
            Open workspace folder
          </button>
          <button
            type="button"
            className="settings-action-btn"
            onClick={() => void handleOpenProjectConfig()}
          >
            Open project .thclaws
          </button>
          <button
            type="button"
            className="settings-action-btn"
            onClick={() => void handleOpenUserConfig()}
          >
            Open thClaws user config
          </button>
        </div>
        <label className="settings-label" htmlFor="thclaws-path">
          Custom binary path (optional)
        </label>
        <input
          id="thclaws-path"
          className="settings-text-input"
          value={aiStructure.thclawsPath}
          placeholder="Auto-detect from PATH"
          onChange={(event) => {
            setAiStructure({
              thclawsPath: event.target.value,
              lastHealthCheckOk: false,
              lastHealthCheckMessage: null,
            });
            void flushPersistPreferences();
          }}
        />
      </fieldset>

      <fieldset className="settings-field">
        <legend className="settings-label">Test & enable</legend>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={aiStructure.runRulePassFirst}
            onChange={(event) => {
              setAiStructure({ runRulePassFirst: event.target.checked });
              void flushPersistPreferences();
            }}
          />
          Run rule-based normalize before AI
        </label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={aiStructure.enabled}
            onChange={(event) => {
              setAiStructure({ enabled: event.target.checked });
              void flushPersistPreferences();
            }}
          />
          Enable AI Structure menu action
        </label>
        <div className="settings-row">
          <button
            type="button"
            className="settings-action-btn settings-action-btn--primary"
            disabled={!canTest}
            onClick={() => void handleTest()}
          >
            {testing ? "Testing…" : "Test connection"}
          </button>
        </div>
      </fieldset>

      <SettingsResetButton onReset={resetAiStructureSettings} label="Reset AI settings" />

      <style>{`
        .ai-setup-status {
          display: grid;
          gap: 4px;
          margin-bottom: 16px;
          padding: 12px 14px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
        }
        .ai-setup-status[data-ready="true"] {
          border-color: color-mix(in srgb, var(--accent) 35%, var(--border-subtle));
        }
        .settings-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 8px 0 12px;
        }
        .settings-action-btn {
          border: 1px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          font-size: 13px;
          cursor: pointer;
        }
        .settings-action-btn:hover {
          background: var(--bg-hover);
        }
        .settings-action-btn--primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .settings-text-input {
          width: 100%;
          box-sizing: border-box;
          margin-top: 6px;
          margin-bottom: 10px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 13px;
        }
        .settings-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
          font-size: 13px;
          color: var(--text-secondary);
        }
      `}</style>
    </section>
  );
}
