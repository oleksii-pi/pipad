// src/components/BoxContext.tsx
import React, { useState, useRef, useEffect } from 'react';
import { streamAnswer } from '../services/openaiApi';
import { FaCamera, FaTimes } from 'react-icons/fa';
import { useStorage } from '../StorageContext';

interface BoxContextProps {
  context: string;
  setContext: React.Dispatch<React.SetStateAction<string>>;
  prompt: string;
  setAnswer: React.Dispatch<React.SetStateAction<string>>;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BoxContext: React.FC<BoxContextProps> = ({
  context,
  setContext,
  prompt,
  setAnswer,
  isStreaming,
  setIsStreaming,
}) => {
  const { storage, setStorage } = useStorage();
  const aiModel = storage["modelName"];
  const openaiSecretKey = storage["apiKey"];
  const prompts = storage["prompts"];
  const systemPrompt = storage["systemPrompt"];
  const textToSpeech = storage["textToSpeech"];
  
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const focusTextarea = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    };

    // Focus on initial mount
    focusTextarea();

    // Focus on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        focusTextarea();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
          reader.readAsDataURL(file);
        }
      }
    }
  };

  async function handleSubmit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();

    if (!openaiSecretKey) {
      console.error('OpenAI secret key is missing');
      setIsStreaming(false);
      return;
    }

    if (isStreaming) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsStreaming(false);
      return;
    }

    setAnswer(''); // Clear previous answer
    setIsStreaming(true);

    // Save prompt to localStorage
    const newPrompts = prompts.filter((p: string) => p !== prompt);
    newPrompts.unshift(prompt);
    setStorage("prompts", newPrompts);
    
    const temperature = 1.0;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fullPrompt = context ? `${prompt}\n\n${context}` : prompt;

    try {
      await streamAnswer(
        abortController,
        openaiSecretKey,
        fullPrompt,
        images,
        temperature,
        (partialText: string) => {
          setAnswer((prev) => prev + partialText);
        },
        (error: string) => {
          console.error(error);
        },
        aiModel,
        systemPrompt,
        textToSpeech
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  }

  const handeTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer('');
    setContext(e.target.value);
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Suggest environment-facing camera
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // On iPhone/iOS Safari, needs muted and playsInline for autoplay
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(err => console.error('Video play error:', err));
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setShowCamera(false);
    }
  };

  const [showImageAdded, setShowImageAdded] = useState(false);

  useEffect(() => {
    if (showImageAdded) {
      const timer = setTimeout(() => {
        setShowImageAdded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showImageAdded]);

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setImages(prev => [...prev, dataUrl]);
      setShowImageAdded(true);
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div id="contextBox" style={{ position: 'relative' }}>
      <textarea
        id="contextTextArea"
        placeholder="Context"
        value={context}
        onChange={handeTextAreaChange}
        onPaste={handlePaste}
        ref={textareaRef}
      />
      <div style={{ position: 'absolute', bottom: 4, left: 4 }}>
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Preview ${index}`}
            width="48"
            height="48"
            onClick={() => setImages(images.filter((_, i) => i !== index))}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 4, right: 4 }}>
        <button tabIndex={-1} onClick={openCamera} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <FaCamera size={24} />
        </button>
      </div>
      <button id="submitButton" onClick={handleSubmit} style={{ position: 'absolute', bottom: 4, right: 4 }}>
        {isStreaming ? 'Cancel' : 'Submit'}
      </button>

      {showCamera && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
          onClick={handleCapture}
        >
          {showImageAdded && (
            <div
              style={{
              position: 'fixed',
              top: '5%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              zIndex: 10000,
              }}
            >
              Image has been added to the context...
            </div>
          )}
          <video
            ref={videoRef}
            style={{ width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'cover' }}
            autoPlay
            playsInline
            muted
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeCamera();
            }}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              padding:0,
              cursor: 'pointer'
            }}
          >
            <FaTimes size={48} />
          </button>
        </div>
      )}
    </div>
  );
};
