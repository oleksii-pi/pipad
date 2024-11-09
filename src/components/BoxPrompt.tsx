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

  const getItems = async () => {
    // Generate 100 example items
    const items = [];
    for (let i = 1; i <= 100; i++) {
      items.push(`Example ${i}`);
    }
    return items;
  };

  const deleteItem = async (item: string) => {
    // Remove the item from your data source
  };

  return (
    <div id="promptBox" style={{ position: 'relative' }}>
      <Autocomplete
        value={prompt}
        onChange={setPrompt}
        getItems={getItems}
        deleteItem={deleteItem}
      >
        <textarea
          id="promptTextArea"
          placeholder="Prompt"
        />
      </Autocomplete>
      <button
        id="settingsButton"
        style={{ position: 'absolute', top: 0, right: 0 }}
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
