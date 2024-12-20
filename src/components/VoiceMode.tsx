// src/components/VoiceMode.tsx

import React, { useState, useRef } from 'react';
import { FaMicrophone, FaTimes } from 'react-icons/fa';
import { useStorage } from '../StorageContext';
import '../styles/globalStyles.css';
import '../styles/globalStyles.dark.css';
import { streamAnswer } from '../services/openaiApi';
import { transcribeAudio } from '../services/openaiApi-voice';

interface VoiceModeProps {
  onClose: () => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onClose }) => {
  const { storage } = useStorage();
  const openAISecretKey = storage["apiKey"];
  const systemPrompt = storage["systemPrompt"];
  const storedDarkMode = storage["darkMode"];

  const [isRecording, setIsRecording] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const styles = {
    container: {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: storedDarkMode ? '#333' : '#fff',
      color: storedDarkMode ? '#fff' : '#000',
    },
    closeButton: {
      position: 'absolute' as 'absolute',
      top: 20,
      right: 20,
      background: '#ccc',
      border: 'none',
      cursor: 'pointer',
      padding: '5px',
      borderRadius: '10%',
      opacity: 0.1,
      color: storedDarkMode ? '#fff' : '#000',
    },
    logTextArea: {
      width: '90%',
      height: '150px',
      marginBottom: '20px',
      backgroundColor: storedDarkMode ? '#555' : '#eee',
      color: storedDarkMode ? '#fff' : '#000',
      padding: '10px',
      borderRadius: '4px',
      resize: 'none' as 'none',
    },
    microphoneButton: {
      background: '#ccc',
      border: 'none',
      cursor: 'pointer',
      padding: '50px',
      borderRadius: '10%',
      outline: 'none',
    },
  };

  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const handleMicrophoneClick = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunksRef.current.push(event.data);
        });

        //! store all messages and provide them to the api for better context

        mediaRecorder.addEventListener('stop', async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'webm' });
          if (openAISecretKey) {
            try {
              const transcription = await transcribeAudio(openAISecretKey, audioBlob);
              addLog(`Transcription: ${transcription}`);

              // Now call streamAnswer with the transcription and system prompt
              const abortController = new AbortController();
              let answer = "";
              await streamAnswer(
                abortController,
                openAISecretKey,
                transcription,
                [],
                0.7,
                (partial: string) => {
                  answer += partial;
                },
                (error: string) => {
                  addLog(`Error in streamAnswer: ${error}`);
                },
                "gpt-3.5-turbo",
                systemPrompt || "",
                true
              );
              addLog(`Answer: ${answer}`);
            } catch (err) {
              const errorMessage = `Error transcribing audio or streaming answer: ${err}`;
              addLog(errorMessage);
            }
          } else {
            addLog("No OpenAI API Key found in storage.");
          }
        });

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        const errorMessage = `Error accessing microphone: ${err}`;
        addLog(errorMessage);
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.closeButton} onClick={onClose}>
        <FaTimes size={24} color={storedDarkMode ? 'red' : 'green'} />
      </button>

      {/* Text box for logging events */}
      <textarea
        style={styles.logTextArea}
        readOnly
        value={logs.join('\n')}
      />

      <button style={styles.microphoneButton} onClick={handleMicrophoneClick}>
        <FaMicrophone size={48} color={isRecording ? 'red' : 'gray'} />
      </button>
    </div>
  );
};
