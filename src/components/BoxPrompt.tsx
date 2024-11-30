// BoxPrompt.tsx
import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';
import { FaCog } from 'react-icons/fa';
import { SettingsDialog } from './SettingsDialog';

interface BoxPromptProps {
  prompt: string;
  setPrompt: (value: string) => void;
  setAnswer: (value: string) => void;
}

export const BoxPrompt: React.FC<BoxPromptProps> = ({ prompt, setPrompt, setAnswer }) => {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = () => {
    setIsSettingsDialogOpen(false);
  };

  const getMRUPrompts = async () => {
    const items = JSON.parse(localStorage.getItem('prompts') || '[]');
    return items;
  };

  const deleteItemFromMRU = async (item: string) => {
    const items = JSON.parse(localStorage.getItem('prompts') || '[]');
    const newItems = items.filter((i: string) => i !== item);
    localStorage.setItem('prompts', JSON.stringify(newItems));
  };

  const handleAutocompleteChange = (text: string) => {
    setPrompt(text);
    setAnswer('');
  };

  return (
    <div id="promptBox">
      <Autocomplete
        value={prompt}
        onChange={handleAutocompleteChange}
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
