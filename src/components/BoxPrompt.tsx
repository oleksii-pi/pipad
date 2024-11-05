import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';
import { FaCog } from 'react-icons/fa';

export const BoxPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <div id="promptBox">
      <textarea
        id="promptTextArea"
        placeholder="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button id="settingsButton" style={{ position: 'absolute', top: 0, right: 0 }}>
        <FaCog />
      </button>
      <Autocomplete inputText={prompt} onSelect={(text) => setPrompt(text)} />
    </div>
  );
};
