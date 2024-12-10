// src/StorageContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { StorageKey } from './constants/StorageKey';
import { StorageDefaultValue } from './constants/StorageDefaultValue';

type StorageValues = {
  [key in StorageKey]: any;
};

interface StorageContextValue {
  storage: StorageValues;
  setStorage: <T>(key: StorageKey, value: T) => void;
}

const StorageContext = createContext<StorageContextValue | undefined>(undefined);

const tryParseJSON = (jsonString: string) => {
  try { return JSON.parse(jsonString); } catch (error) {}
  return jsonString;
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storage, setStorageState] = useState<StorageValues>(() => {
    const initialValues: Partial<StorageValues> = {};
    for (const key of Object.values(StorageKey)) {
      const item = localStorage.getItem(key);
      initialValues[key as StorageKey] = item !== null 
        ? tryParseJSON(item)
        : StorageDefaultValue[key as StorageKey];
    }
    return initialValues as StorageValues;
  });

  const setStorage = <T,>(key: StorageKey, value: T) => {
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
