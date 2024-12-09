// src/components/BoxPrompt.tsx
import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';
import { FaCog } from 'react-icons/fa';
import { SettingsDialog } from './SettingsDialog';
import { StorageKey } from '../constants/StorageKey';
import { useStorage } from '../StorageContext';

interface BoxPromptProps {
  prompt: string;
  setPrompt: (value: string) => void;
  setAnswer: (value: string) => void;
}

export const BoxPrompt: React.FC<BoxPromptProps> = ({ prompt, setPrompt, setAnswer }) => {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  const { storage, setStorage } = useStorage();
  const prompts = storage[StorageKey.Prompts] as string[];

  const handleSettingsClick = () => {
    setIsSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = () => {
    setIsSettingsDialogOpen(false);
  };

  const getMRUPrompts = () => {
    return Promise.resolve(prompts);
  };

  const deleteItemFromMRU = (item: string) => {
    const newItems = prompts.filter((i: string) => i !== item);
    setStorage(StorageKey.Prompts, newItems);
    return Promise.resolve();
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
        <FaCog size={24}/>
      </button>
      {isSettingsDialogOpen && (
        <SettingsDialog onClose={handleCloseSettingsDialog} />
      )}
    </div>
  );
};
