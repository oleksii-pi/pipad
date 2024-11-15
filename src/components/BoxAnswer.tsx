// src/components/BoxAnswer.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import '../styles/github-markdown-light.css'

interface BoxAnswerProps {
  answer: string;
  setAnswer: (value: string) => void;
  isStreaming: boolean;
}

export const BoxAnswer: React.FC<BoxAnswerProps> = ({ answer, setAnswer, isStreaming }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMarkdown, setIsMarkdown] = useState(false);

  useEffect(() => {
    if (!isStreaming && !isMarkdown) {
      // Streaming is completed, focus and select all text in the textarea
      if (textareaRef.current && textareaRef.current.value !== '') {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }
  }, [isStreaming, isMarkdown]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMarkdown(e.target.checked);
  };

  return (
    <div id="answerBox">
      <input type="checkbox" title='Markdown preview' tabIndex={-1} checked={isMarkdown} onChange={handleCheckboxChange} />

      {isMarkdown ? (
        <div className="markdown-rendered">
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{answer}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          id="answerTextArea"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          ref={textareaRef}
        />
      )}
    </div>
  );
};
