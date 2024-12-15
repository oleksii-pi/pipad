// src/components/SettingsDialog.tsx
import React, { useState } from 'react';
import { useStorage } from '../StorageContext';

export const SettingsDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { storage, setStorage } = useStorage();
  const storedModelName = storage["modelName"];
  const storedSystemPrompt = storage["systemPrompt"];
  const storedDarkMode = storage["darkMode"];
  const textToSpeech = storage["textToSpeech"];
  const storedVoiceMode = storage["voiceMode"];

  const [localModelName, setLocalModelName] = useState(storedModelName);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(storedSystemPrompt);
  const [localApiKey, setLocalApiKey] = useState<string>('');
  const [localDarkMode, setLocalDarkMode] = useState(storedDarkMode);
  const [localTextToSpeech, setLocalTextToSpeech] = useState(textToSpeech);
  const [localVoiceMode, setLocalVoiceMode] = useState(storedVoiceMode);

  const handleUpdate = () => {
    setStorage("modelName", localModelName);
    setStorage("systemPrompt", localSystemPrompt);
    if (localApiKey !== '') {
      setStorage("apiKey", localApiKey);
    }
    setStorage("darkMode", localDarkMode);
    setStorage("textToSpeech", localTextToSpeech);
    setStorage("voiceMode", localVoiceMode);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <label><span style={{ color: 'red' }}>* </span>Model name:</label>
        <input
          type="text"
          value={localModelName}
          onChange={(e) => setLocalModelName(e.target.value)}
        />

        <label>System prompt:</label>
        <input
          type="text"
          value={localSystemPrompt}
          onChange={(e) => setLocalSystemPrompt(e.target.value)}
        />

        <label><span style={{ color: 'red' }}>* </span>OpenAI Key:</label>
        <input
          type="password"
          placeholder="****************"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
        />
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.6em' }}
        >
          Get your OpenAI API key
        </a>

        <label>
          <input
            type="checkbox"
            checked={localDarkMode}
            onChange={(e) => setLocalDarkMode(e.target.checked)}
          />
          Dark mode
        </label>

        <label>
          <input
            type="checkbox"
            checked={localTextToSpeech}
            onChange={(e) => setLocalTextToSpeech(e.target.checked)}
          />
          Text to speech
        </label>

        <label>
          <input
            type="checkbox"
            checked={localVoiceMode}
            onChange={(e) => setLocalVoiceMode(e.target.checked)}
          />
          Voice mode
        </label>

        <div className="button-row">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
};
