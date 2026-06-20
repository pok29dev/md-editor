export interface AiStructurePreferences {
  enabled: boolean;
  thclawsPath: string;
  /** When true, omit --model and let thClaws use its own defaults. */
  useThclawsDefaults: boolean;
  /** When useThclawsDefaults is false, sent as `thclaws --model <value>` per run. */
  model: string;
  runRulePassFirst: boolean;
  lastHealthCheckOk: boolean;
  lastHealthCheckAt: number | null;
  lastHealthCheckMessage: string | null;
}

export const DEFAULT_AI_STRUCTURE_PREFERENCES: AiStructurePreferences = {
  enabled: false,
  thclawsPath: "",
  useThclawsDefaults: true,
  model: "",
  runRulePassFirst: true,
  lastHealthCheckOk: false,
  lastHealthCheckAt: null,
  lastHealthCheckMessage: null,
};

export const THCLAWS_INSTALL_URL = "https://github.com/thClaws/thClaws";

/** Examples only — md-editor does not read or write thClaws config. */
export const AI_STRUCTURE_MODEL_EXAMPLES = [
  "claude-sonnet-4-6",
  "gpt-4o",
  "dashscope/qwen-max",
  "thaillm/openthaigpt",
  "openrouter/anthropic/claude-sonnet-4-6",
  "ollama/llama3.2",
];

export function normalizeAiStructurePreferences(
  raw: Partial<AiStructurePreferences> | undefined,
): AiStructurePreferences {
  const useThclawsDefaults =
    raw?.useThclawsDefaults ?? DEFAULT_AI_STRUCTURE_PREFERENCES.useThclawsDefaults;
  return {
    ...DEFAULT_AI_STRUCTURE_PREFERENCES,
    ...raw,
    useThclawsDefaults,
    model: raw?.model?.trim() ?? "",
    thclawsPath: raw?.thclawsPath?.trim() ?? "",
    lastHealthCheckAt:
      typeof raw?.lastHealthCheckAt === "number" ? raw.lastHealthCheckAt : null,
    lastHealthCheckMessage: raw?.lastHealthCheckMessage ?? null,
  };
}

export function isAiStructureReady(prefs: AiStructurePreferences): boolean {
  if (!prefs.enabled || !prefs.lastHealthCheckOk) return false;
  if (prefs.useThclawsDefaults) return true;
  return prefs.model.trim().length > 0;
}
