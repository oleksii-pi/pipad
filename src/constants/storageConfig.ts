// src/storageConfig.ts

export const defaultStorageValues = {
  modelName: "gpt-4o-mini" as string,
  apiKey: "" as string,
  darkMode: false as boolean,
  prompts: [] as string[],
  systemPrompt: "" as string,
  textToSpeech: false as boolean,
  voiceMode: false as boolean,
} as const;

export type StorageKey = keyof typeof defaultStorageValues;

export type StorageValues = {
  [K in StorageKey]: (typeof defaultStorageValues)[K];
};
