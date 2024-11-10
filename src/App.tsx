// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BoxPrompt } from './components/BoxPrompt';
import { BoxContext } from './components/BoxContext';
import { BoxAnswer } from './components/BoxAnswer';
import { SettingsDialog } from './components/SettingsDialog';
import './styles/globalStyles.css';

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const modelName = localStorage.getItem('modelName');
    if (!modelName) setSettingsOpen(true);
  }, []);

  return (
    <div className="app">
      {settingsOpen && <SettingsDialog onUpdate={() => setSettingsOpen(false)} />}
      <div className="left-panel" />
      <div className="center-panel">
        <BoxPrompt prompt={prompt} setPrompt={setPrompt} />
        <BoxContext prompt={prompt} setAnswer={setAnswer} />
        <BoxAnswer answer={answer} />
      </div>
      <div className="right-panel" />
    </div>
  );
};

export default App;
