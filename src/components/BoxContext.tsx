// src/components/BoxContext.tsx
import React, { useState, useRef, useEffect } from 'react';
import { streamAnswer } from '../services/openaiApi';
import { FaCamera } from 'react-icons/fa';

interface BoxContextProps {
  prompt: string;
  setAnswer: React.Dispatch<React.SetStateAction<string>>;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BoxContext: React.FC<BoxContextProps> = ({
  prompt,
  setAnswer,
  isStreaming,
  setIsStreaming,
}) => {
  const [context, setContext] = useState('');
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

    if (isStreaming) {
      // If streaming, cancel the streaming
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsStreaming(false);
      return;
    }

    // If not streaming, start streaming
    setAnswer(''); // Clear previous answer
    setIsStreaming(true);

    // Save prompt to localStorage
    const storedPrompts = localStorage.getItem('prompts');
    const prompts = storedPrompts ? JSON.parse(storedPrompts).filter((p: string) => p !== prompt) : [];
    prompts.unshift(prompt);
    localStorage.setItem('prompts', JSON.stringify(prompts));

    // Get settings
    const openaiSecretKey = localStorage.getItem('apiKey');
    const aiModel = localStorage.getItem('modelName') || 'gpt-4o';
    const temperature = 1.0;

    if (!openaiSecretKey) {
      console.error('OpenAI secret key is missing');
      setIsStreaming(false);
      return;
    }

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
        aiModel
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
    }

    closeCamera();
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
          <img key={index} src={img} alt={`Preview ${index}`} width="48" height="48" />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 4, right: 4 }}>
        <button onClick={openCamera} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
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
          <video
            ref={videoRef}
            style={{ width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'cover' }}
            autoPlay
            playsInline
            muted
          />
        </div>
      )}
    </div>
  );
};
