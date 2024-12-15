// src/StorageContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { defaultStorageValues, StorageKey, StorageValues } from './constants/storageConfig';

const StorageContext = createContext<{
  storage: StorageValues;
  setStorage: <K extends StorageKey>(key: K, value: StorageValues[K]) => void;
} | undefined>(undefined);

const tryParseJSON = (jsonString: string) => {
  try { 
    return JSON.parse(jsonString);
  } catch {
    return jsonString;
  }
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storage, setStorageState] = useState<StorageValues>(() => {
    const initialValues = { ...defaultStorageValues };
    for (const key in defaultStorageValues) {
      const item = localStorage.getItem(key);
      if (item !== null) {
        const parsed = tryParseJSON(item);
        // Type-casting here is safe because we trust defaultStorageValues shape
        (initialValues as any)[key] = parsed;
      }
    }
    return initialValues;
  });

  const setStorage = <K extends StorageKey>(key: K, value: StorageValues[K]) => {
    localStorage.setItem(key, JSON.stringify(value));
    setStorageState(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <StorageContext.Provider value={{ storage, setStorage }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};