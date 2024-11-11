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
  const [isStreaming, setIsStreaming] = useState(false); // Moved isStreaming state here

  useEffect(() => {
    setPrompt(JSON.parse(localStorage.getItem('prompts') || '[""]')[0]);

    const modelName = localStorage.getItem('modelName');
    if (!modelName) setSettingsOpen(true);
  }, []);

  return (
    <div className="app">
      {settingsOpen && <SettingsDialog onUpdate={() => setSettingsOpen(false)} />}
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

