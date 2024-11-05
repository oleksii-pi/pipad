// src/components/Autocomplete.tsx
import React, { useState, useEffect } from 'react';

type AutocompleteProps = {
  inputText: string;
  onSelect: (text: string) => void;
};

export const Autocomplete: React.FC<AutocompleteProps> = ({ inputText, onSelect }) => {
  const [mruList, setMruList] = useState<string[]>([]);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);

  useEffect(() => {
    // Filtering MRU based on input
    setFilteredItems(mruList.filter(item => item.includes(inputText)));
  }, [inputText, mruList]);

  const handleSelect = (text: string) => {
    onSelect(text);
    setMruList([text, ...mruList.filter(item => item !== text)]);
  };

  return (
    <div className="autocomplete">
      {filteredItems.map((item, index) => (
        <div key={index} onClick={() => handleSelect(item)}>
          {item}
        </div>
      ))}
    </div>
  );
};
