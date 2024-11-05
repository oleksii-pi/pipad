import React, { useState } from 'react';

export const BoxContext: React.FC = () => {
  const [context, setContext] = useState('');
  const [images, setImages] = useState<string[]>([]);

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

  return (
    <div id="contextBox">
      <textarea
        id="contextTextArea"
        placeholder="Context"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        onPaste={handlePaste}
      />
      {images.map((img, index) => (
        <img key={index} src={img} alt={`Preview ${index}`} width="64" height="64" />
      ))}
      <button id="submitButton" style={{ position: 'absolute', bottom: 0, right: 0 }}>
        Submit
      </button>
    </div>
  );
};
