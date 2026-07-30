import React, { createContext, useContext, useState, useEffect } from 'react';

// Shares the compare selection (up to MAX_COMPARE vehicle ids) across the card
// buttons, the sidebar badge, and the compare page, persisted to localStorage so
// a refresh keeps the picks.
const CompareContext = createContext(null);

const STORAGE_KEY = 'compareVehicleIds';
export const MAX_COMPARE = 3;

const readStoredIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const CompareProvider = ({ children }) => {
  const [compareIds, setCompareIds] = useState(readStoredIds);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
  }, [compareIds]);

  const isInCompare = (id) => compareIds.includes(id);

  // Silently no-ops past the cap — callers (e.g. CompareButton) disable the
  // control themselves once full, so this is a safety net, not the primary guard.
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((existing) => existing !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const removeFromCompare = (id) => {
    setCompareIds((prev) => prev.filter((existing) => existing !== id));
  };

  const clearCompare = () => setCompareIds([]);

  return (
    <CompareContext.Provider value={{ compareIds, isInCompare, toggleCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
