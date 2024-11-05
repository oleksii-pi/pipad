// src/components/SettingsDialog.tsx
import React, { useState } from 'react';

export const SettingsDialog: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [modelName, setModelName] = useState(localStorage.getItem('modelName') || 'gpt-4o');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('darkMode') || 'true'));

  const handleUpdate = () => {
    localStorage.setItem('modelName', modelName);
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    onUpdate();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <label>Model name:</label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
        />
        
        <label>OpenAI Key:</label>
        <input
          type="password"
          placeholder="****************"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          Dark mode
        </label>
        
        <div className="button-row">
          <button onClick={onUpdate}>Cancel</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
};
