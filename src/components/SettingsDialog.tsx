// src/components/SettingsDialog.tsx
import React, { useState } from 'react';
import { StorageKey } from '../constants/StorageKey';
import { useStorage } from '../StorageContext';

export const SettingsDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { storage, setStorage } = useStorage();
  const modelName = storage[StorageKey.ModelName] as string;
  const darkMode = storage[StorageKey.DarkMode] as boolean;

  const [localModelName, setLocalModelName] = useState(modelName);
  const [localApiKey, setLocalApiKey] = useState('');
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);

  const handleUpdate = () => {
    setStorage(StorageKey.ModelName, localModelName);
    if (localApiKey !== '') {
      setStorage(StorageKey.ApiKey, localApiKey);
    }
    setStorage(StorageKey.DarkMode, localDarkMode);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <label>Model name:</label>
        <input
          type="text"
          value={localModelName}
          onChange={(e) => setLocalModelName(e.target.value)}
        />

        <label>OpenAI Key:</label>
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

        <div className="button-row">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
};

