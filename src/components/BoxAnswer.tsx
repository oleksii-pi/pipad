// src/components/BoxAnswer.tsx
import React from 'react';

interface BoxAnswerProps {
  answer: string;
}

export const BoxAnswer: React.FC<BoxAnswerProps> = ({ answer }) => {
  return (
    <div id="answerBox">
      <textarea
        id="answerTextArea"
        placeholder="Answer"
        value={answer}
        readOnly
      />
    </div>
  );
};
