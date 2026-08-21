import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  appClipboard: string | null;
  copyText: (text: string, label?: string) => Promise<boolean>;
  pasteText: () => Promise<string | null>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'smart_calc_history_v2';
const CLIPBOARD_STORAGE_KEY = 'smart_calc_clipboard_v1';

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
  
  // App-level clipboard cache
  const [appClipboard, setAppClipboard] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CLIPBOARD_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Global Toast indicator for copy/paste feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  const copyText = useCallback(async (text: string, label?: string): Promise<boolean> => {
    if (!text && text !== '0') return false;
    const cleanStr = String(text).trim();
    setAppClipboard(cleanStr);
    try {
      localStorage.setItem(CLIPBOARD_STORAGE_KEY, cleanStr);
    } catch {}

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cleanStr);
      }
      showToast(label ? `Copied: ${label}` : `Copied: "${cleanStr.length > 25 ? cleanStr.slice(0, 25) + '...' : cleanStr}"`);
      return true;
    } catch (err) {
      console.warn('System clipboard write restricted, cached in app clipboard', err);
      showToast(`Copied to app clipboard`);
      return true;
    }
  }, [showToast]);

  const pasteText = useCallback(async (): Promise<string | null> => {
    let text = '';
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
    } catch (err) {
      console.warn('Clipboard readText restricted, using app clipboard fallback', err);
    }

    if (!text) {
      text = appClipboard || localStorage.getItem(CLIPBOARD_STORAGE_KEY) || '';
    }

    if (text) {
      const clean = text.trim();
      showToast(`Pasted: "${clean.length > 25 ? clean.slice(0, 25) + '...' : clean}"`);
      return clean;
    } else {
      showToast('Clipboard is empty');
      return null;
    }
  }, [appClipboard, showToast]);

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
        appClipboard,
        copyText,
        pasteText,
        toastMessage,
        showToast,
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

