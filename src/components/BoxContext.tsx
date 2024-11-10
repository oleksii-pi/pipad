import React, { useState, useRef, useEffect } from 'react';

interface BoxContextProps {
  prompt: string;
}

export const BoxContext: React.FC<BoxContextProps> = ({ prompt }) => {
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

  function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const prompts = JSON.parse(localStorage.getItem('prompts') || '[]').filter((p: string) => p !== prompt);
    prompts.unshift(prompt);
    localStorage.setItem('prompts', JSON.stringify(prompts));
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
