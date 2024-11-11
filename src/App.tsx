// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BoxPrompt } from './components/BoxPrompt';
import { BoxContext } from './components/BoxContext';
import { BoxAnswer } from './components/BoxAnswer';
import { SettingsDialog } from './components/SettingsDialog';
import './styles/globalStyles.css';
import './styles/globalStyles.dark.css';

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Add darkMode state

  useEffect(() => {
    setPrompt(JSON.parse(localStorage.getItem('prompts') || '[""]')[0]);

    const modelName = localStorage.getItem('modelName');
    if (!modelName) setSettingsOpen(true);

    // Read darkMode setting from localStorage
    const storedDarkMode = JSON.parse(localStorage.getItem('darkMode') || 'true');
    setDarkMode(storedDarkMode);
  }, []);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {settingsOpen && (
        <SettingsDialog
          onUpdate={() => {
            // Update darkMode when settings dialog is closed
            const storedDarkMode = JSON.parse(localStorage.getItem('darkMode') || 'true');
            setDarkMode(storedDarkMode);
            setSettingsOpen(false);
          }}
        />
      )}
      <div className="left-panel" />
      <div className="center-panel">
        <BoxPrompt prompt={prompt} setPrompt={setPrompt} setAnswer={setAnswer} />
        <BoxContext
          prompt={prompt}
          setAnswer={setAnswer}
          isStreaming={isStreaming}
          setIsStreaming={setIsStreaming}
        />
        <BoxAnswer answer={answer} setAnswer={setAnswer} isStreaming={isStreaming} />
      </div>
      <div className="right-panel" />
    </div>
  );
};

export default App;
