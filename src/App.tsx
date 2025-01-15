// src/App.tsx
import React, { useState } from 'react';
import { BoxPrompt } from './components/BoxPrompt';
import { BoxContext } from './components/BoxContext';
import { BoxAnswer } from './components/BoxAnswer';
import { SettingsDialog } from './components/SettingsDialog';
import { VoiceMode } from './components/VoiceMode';
import './styles/globalStyles.css';
import './styles/globalStyles.dark.css';
import Split from 'react-split';
import { useStorage } from './StorageContext';

const App: React.FC = () => {
  const { storage, setStorage } = useStorage();
  const storedPrompts = storage["prompts"];
  const storedApiKey = storage["apiKey"];
  const storedDarkMode = storage["darkMode"];
  const voiceMode = storage["voiceMode"];

  const [prompt, setPrompt] = useState(storedPrompts.length > 0 ? storedPrompts[0] : '');
  const [answer, setAnswer] = useState('');
  const [context, setContext] = useState('');
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(storedApiKey === '');

  return (
    <div className={`app ${storedDarkMode ? 'dark-mode' : ''}`}>
      {settingsOpen && (
        <SettingsDialog
          onClose={() => {
            // reload storedDarkMode from local storage and update UI
            setSettingsOpen(false);
          }}
        />
      )}
      <div className="left-panel" />
      <div className="center-panel">
        <Split
          style={{width: "100%", height: "100%"}}
          sizes={[7, 93]}       // Initial sizes of the panes in percentages
          minSize={50}          // Minimum size of each pane in pixels
          gutterSize={4}        // Size of the gutter in pixels
          direction="vertical"  // Direction of the splitter
          cursor="row-resize"   // Cursor to display when hovering over the gutter
        >
          <div>
            <BoxPrompt prompt={prompt} setPrompt={setPrompt} setAnswer={setAnswer} />
          </div>
          <Split
            sizes={[20, 80]}       // Initial sizes of the panes in percentages
            minSize={100}          // Minimum size of each pane in pixels
            gutterSize={4}         // Size of the gutter in pixels
            direction="vertical"   // Direction of the splitter
            cursor="row-resize"    // Cursor to display when hovering over the gutter
          >
            <div style={{width: "100%"}}>
              <BoxContext
                context={context}
                setContext={setContext}
                prompt={prompt}
                setAnswer={setAnswer}
                isStreaming={isStreaming}
                setIsStreaming={setIsStreaming}
              />
            </div>
            <div style={{width: "100%"}}>
              {voiceMode ? (
                <VoiceMode onClose={() => {setStorage("voiceMode", false)}} />
              ) : (
                <BoxAnswer 
                  answer={answer} 
                  setAnswer={setAnswer} 
                  isStreaming={isStreaming}
                />
              )}
            </div>
          </Split>
        </Split>
      </div>
      <div className="right-panel" />
    </div>
  );
};

export default App;
