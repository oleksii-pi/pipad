// src/components/VoiceMode.tsx
import React, { useState, useRef } from 'react';
import { FaMicrophone, FaTimes } from 'react-icons/fa';
import { useStorage } from '../StorageContext';
import '../styles/globalStyles.css';
import '../styles/globalStyles.dark.css';
import { streamAnswer } from '../services/openaiApi';
import { transcribeAudio,  } from '../services/openaiApi-voice';

interface VoiceModeProps {
  onClose: () => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onClose }) => {
  const { storage } = useStorage();
  const openAISecretKey = storage["apiKey"];
  const systemPrompt = storage["systemPrompt"];
  const storedDarkMode = storage["darkMode"];
  const [isRecording, setIsRecording] = useState(false);
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
    microphoneButton: {
      background: '#ccc',
      border: 'none',
      cursor: 'pointer',
      padding: '50px',
      borderRadius: '10%',
      outline: 'none',
    },
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

        mediaRecorder.addEventListener('stop', async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (openAISecretKey) {
            try {
              // Transcribe the recorded audio
              const transcription = await transcribeAudio(openAISecretKey, audioBlob);

              console.log("Transcription:", transcription);

              // Now call streamAnswer with the transcription and system prompt
              const abortController = new AbortController();
              await streamAnswer(
                abortController,
                openAISecretKey,
                transcription,
                [],
                0.7,
                (partial: string) => {
                  console.log("Partial response:", partial);
                },
                (error: string) => {
                  console.error("Error in streamAnswer:", error);
                },
                "gpt-3.5-turbo",
                systemPrompt || "",
                true
              );
            } catch (err) {
              console.error("Error transcribing audio or streaming answer:", err);
            }
          } else {
            console.error("No OpenAI API Key found in storage.");
          }
        });

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
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
      <button style={styles.microphoneButton} onClick={handleMicrophoneClick}>
        <FaMicrophone size={48} color={isRecording ? 'red' : 'gray'} />
      </button>
    </div>
  );
};
