// src/components/BoxContext.tsx
import React, { useState, useRef, useEffect } from 'react';
import { streamAnswer } from '../services/openaiApi';

interface BoxContextProps {
  prompt: string;
  setAnswer: React.Dispatch<React.SetStateAction<string>>;
}

export const BoxContext: React.FC<BoxContextProps> = ({ prompt, setAnswer }) => {
  const [context, setContext] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
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

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault();

    // Save prompt to localStorage
    const prompts = JSON.parse(localStorage.getItem('prompts') || '[]').filter((p: string) => p !== prompt);
    prompts.unshift(prompt);
    localStorage.setItem('prompts', JSON.stringify(prompts));

    // Get settings
    const openaiSecretKey = localStorage.getItem('apiKey');
    const aiModel = localStorage.getItem('modelName') || 'gpt-4o';
    const temperature = 1.0;
    const maxTokens = 3000;

    if (!openaiSecretKey) {
      console.error('OpenAI secret key is missing');
      return;
    }

    setAnswer(''); // Clear previous answer

    const abortController = new AbortController();

    // Combine prompt and context if needed
    const fullPrompt = context ? `${prompt}\n\n${context}` : prompt;

    // Call streamAnswer
    await streamAnswer(
      abortController,
      openaiSecretKey,
      fullPrompt,
      images,
      temperature,
      maxTokens,
      (partialText: string) => {
        setAnswer((prev) => prev + partialText);
      },
      (error: string) => {
        console.error(error);
      },
      aiModel
    );
  }

  return (
    <div id="contextBox">
      <textarea
        id="contextTextArea"
        placeholder="Context"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        onPaste={handlePaste}
        ref={textareaRef}
      />
      {images.map((img, index) => (
        <img key={index} src={img} alt={`Preview ${index}`} width="64" height="64" />
      ))}
      <button id="submitButton" onClick={handleSubmit} style={{ position: 'absolute', bottom: 4, right: 4 }}>
        Submit
      </button>
    </div>
  );
};
