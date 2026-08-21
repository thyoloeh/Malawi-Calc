import React, { createContext, useContext, useState, useEffect } from 'react';
import { HistoryItem, CalculationType } from '../types/history';

interface HistoryContextType {
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  selectedHistoryItem: HistoryItem | null;
  setSelectedHistoryItem: (item: HistoryItem | null) => void;
  activeModule: 'standard' | 'fractions' | 'equations' | 'conversions' | 'statistics';
  setActiveModule: (mod: 'standard' | 'fractions' | 'equations' | 'conversions' | 'statistics') => void;
  injectedExpression: string | null;
  setInjectedExpression: (expr: string | null) => void;
}

const STORAGE_KEY = 'smart_calc_history_v2';

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [activeModule, setActiveModule] = useState<'standard' | 'fractions' | 'equations' | 'conversions' | 'statistics'>('standard');
  const [injectedExpression, setInjectedExpression] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save calculation history to localStorage', e);
    }
  }, [history]);

  const addHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 99)]); // Keep last 100 items
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        addHistory,
        clearHistory,
        deleteHistoryItem,
        isDrawerOpen,
        setIsDrawerOpen,
        selectedHistoryItem,
        setSelectedHistoryItem,
        activeModule,
        setActiveModule,
        injectedExpression,
        setInjectedExpression,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
