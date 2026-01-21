import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@colorcoord_history';
const MAX_HISTORY_ITEMS = 50;

export interface HistoryItem {
  codeId: string;
  viewedAt: string;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  const addToHistory = useCallback(
    async (codeId: string) => {
      // 既存のエントリを削除して先頭に追加
      const filtered = history.filter((h) => h.codeId !== codeId);
      const newItem: HistoryItem = {
        codeId,
        viewedAt: new Date().toISOString(),
      };
      const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      await saveHistory(newHistory);
    },
    [history]
  );

  const clearHistory = useCallback(async () => {
    await saveHistory([]);
  }, []);

  const removeFromHistory = useCallback(
    async (codeId: string) => {
      const newHistory = history.filter((h) => h.codeId !== codeId);
      await saveHistory(newHistory);
    },
    [history]
  );

  return {
    history,
    loading,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
