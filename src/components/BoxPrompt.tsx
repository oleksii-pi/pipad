// BoxPrompt.tsx
import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';
import { FaCog } from 'react-icons/fa';
import { SettingsDialog } from './SettingsDialog';

export const BoxPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = () => {
    setIsSettingsDialogOpen(false);
  };

  const getMRUPrompts = async () => {
    // Generate 100 example items
    const items = [];
    for (let i = 1; i <= 100; i++) {
      items.push(`Example ${i}`);
    }
    return items;
  };

  const deleteItemFromMRU = async (item: string) => {
    // Remove the item from MRU
  };

  return (
    <div id="promptBox" style={{ position: 'relative' }}>
      <Autocomplete
        value={prompt}
        onChange={setPrompt}
        getItems={getMRUPrompts}
        deleteItem={deleteItemFromMRU}
      >
        <textarea
          id="promptTextArea"
          placeholder="Prompt"
        />
      </Autocomplete>
      <button
        id="settingsButton"
        style={{ position: 'absolute', top: 4, right: 4 }}
        onClick={handleSettingsClick}
        tabIndex={-1}
      >
        <FaCog />
      </button>
      {isSettingsDialogOpen && (
        <SettingsDialog onUpdate={handleCloseSettingsDialog} />
      )}
    </div>
  );
};
