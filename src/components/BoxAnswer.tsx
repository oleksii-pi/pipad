// src/components/BoxAnswer.tsx
import React, { useEffect, useRef } from 'react';

interface BoxAnswerProps {
  answer: string;
  setAnswer: (value: string) => void;
  isStreaming: boolean;
}

export const BoxAnswer: React.FC<BoxAnswerProps> = ({ answer, setAnswer, isStreaming }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming) {
      // Streaming is completed, focus and select all text in the textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }
  }, [isStreaming]);

  return (
    <div id="answerBox">
      <textarea
        id="answerTextArea"
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        ref={textareaRef}
      />
    </div>
  );
};

