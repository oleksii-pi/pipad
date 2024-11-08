import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';
import { FaCog } from 'react-icons/fa';
import { SettingsDialog } from './SettingsDialog'; // Make sure to import the SettingsDialog component

export const BoxPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = () => {
    setIsSettingsDialogOpen(false);
  };

  return (
    <div id="promptBox">
      <textarea
        id="promptTextArea"
        placeholder="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        id="settingsButton"
        style={{ position: 'absolute', top: 0, right: 0 }}
        onClick={handleSettingsClick}
      >
        <FaCog />
      </button>
      <Autocomplete inputText={prompt} onSelect={(text) => setPrompt(text)} />
      {isSettingsDialogOpen && <SettingsDialog onUpdate={handleCloseSettingsDialog} />}
    </div>
  );
};
