// Autocomplete.tsx
import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { createPortal } from 'react-dom';

interface AutocompleteProps {
  value: string;
  onChange: (text: string) => void;
  getItems: () => Promise<string[]>;
  deleteItem: (item: string) => Promise<void>;
  children: ReactElement;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  getItems,
  deleteItem,
  children,
}) => {
  const [mruItems, setMruItems] = useState<string[]>([]);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const popupRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    // Load MRU items on mount
    const loadItems = async () => {
      const items = await getItems();
      setMruItems(items);
    };
    loadItems();
  }, [getItems]);

  useEffect(() => {
    if (value.length === 0) {
      // If textarea is empty, show all MRU items
      setFilteredItems(mruItems);
    } else {
      // Filter MRU items based on the current input
      const filtered = mruItems.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setSelectedIndex(-1);
  }, [value, mruItems]);

  useEffect(() => {
    // Update popup position whenever showPopup changes
    if (showPopup && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPopupStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        maxHeight: '400px',
        overflowY: 'auto',
        listStyleType: 'none',
        margin: 0,
        padding: 0,
        zIndex: 1000,
      });
    }
  }, [showPopup]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPopup) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          (prevIndex + filteredItems.length - 1) % filteredItems.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
          const selectedItem = filteredItems[selectedIndex];
          onChange(selectedItem);
          updateMru(selectedItem);
          setShowPopup(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPopup(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setShowPopup(true); // Show popup when user types
  };

  const updateMru = (item: string) => {
    setMruItems((prevItems) => {
      const newItems = [item, ...prevItems.filter((i) => i !== item)];
      return newItems.slice(0, 15); // Keep only the most recent 15 items
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !popupRef.current?.contains(e.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const clonedChild = React.cloneElement(children, {
    ref: inputRef,
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
  });

  const popup = showPopup && filteredItems.length > 0 && (
    <ul
      ref={popupRef}
      style={popupStyle}
    >
      {filteredItems.map((item, index) => (
        <li
          key={item}
          onClick={() => {
            onChange(item);
            updateMru(item);
            inputRef?.current?.focus();
            setShowPopup(false); // Hide popup after selection
          }}
          onMouseEnter={() => setSelectedIndex(index)}
          style={{
            padding: '5px 10px',
            backgroundColor: index === selectedIndex ? '#bde4ff' : 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <span>{item}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(item);
              setMruItems((prevItems) => prevItems.filter((i) => i !== item));
            }}
            style={{ cursor: 'no-drop', border: 'none', padding: '4px', color: 'red' }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div style={{ position: 'relative' }}>
        {clonedChild}
      </div>
      {popup && createPortal(popup, document.body)}
    </>
  );
};
