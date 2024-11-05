import React, { useEffect, useState } from 'react';
import { BoxPrompt } from './components/BoxPrompt';
import { BoxContext } from './components/BoxContext';
import { BoxAnswer } from './components/BoxAnswer';
import { SettingsDialog } from './components/SettingsDialog';
import './styles/globalStyles.css';

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const modelName = localStorage.getItem('modelName');
    if (!modelName) setSettingsOpen(true);
  }, []);

  return (
    <div className="container">
      {settingsOpen && <SettingsDialog onUpdate={() => setSettingsOpen(false)} />}
      <div className="left-pane" />
      <div className="center-pane">
        <BoxPrompt />
        <BoxContext />
        <BoxAnswer />
      </div>
      <div className="right-pane" />
    </div>
  );
};

export default App;
