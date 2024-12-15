import React from 'react';
import { FaMicrophone, FaTimes } from 'react-icons/fa';
import { useStorage } from '../StorageContext';
import '../styles/globalStyles.css';
import '../styles/globalStyles.dark.css';

interface VoiceModeProps {
  onClose: () => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onClose }) => {
  const { storage } = useStorage();
  const storedDarkMode = storage["darkMode"];

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
      color: storedDarkMode ? '#fff' : '#000',
    },
    microphoneButton: {
      background: '#ccc',
      border: 'none',
      cursor: 'pointer',
      padding: '50px',
      borderRadius: '10%',
      color: storedDarkMode ? '#fff' : '#000',
    },
  };

  return (
    <div style={styles.container}>
      <button style={styles.closeButton} onClick={onClose}>
        <FaTimes size={24} color={storedDarkMode ? 'red' : 'green'} />
      </button>
      <button style={styles.microphoneButton}>
        <FaMicrophone size={48} color={storedDarkMode ? 'red' : 'green'} />
      </button>
    </div>
  );
};
