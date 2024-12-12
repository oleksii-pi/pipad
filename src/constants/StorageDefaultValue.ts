// src/constants/StorageDefaultValue.ts
import { StorageKey } from "./StorageKey";

export const StorageDefaultValue: Record<StorageKey, any> = {
  [StorageKey.ModelName]: "gpt-4o-mini",
  [StorageKey.ApiKey]: "",
  [StorageKey.DarkMode]: false,
  [StorageKey.Prompts]: [],
  [StorageKey.SystemPrompt]: "",
};
