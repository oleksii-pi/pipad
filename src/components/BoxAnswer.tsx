// src/components/BoxAnswer.tsx
import React, { useState } from 'react';

export const BoxAnswer: React.FC = () => {
  const [answer, setAnswer] = useState('');

  return (
    <div id="answerBox" >
      <textarea
        id="answerTextArea"
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
    </div>
  );
};
