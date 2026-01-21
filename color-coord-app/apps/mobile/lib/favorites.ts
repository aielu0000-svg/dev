import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@colorcoord_favorites';

export interface Favorite {
  codeId: string;
  createdAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: Favorite[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  };

  const isFavorite = useCallback(
    (codeId: string) => favorites.some((f) => f.codeId === codeId),
    [favorites]
  );

  const addFavorite = useCallback(
    async (codeId: string) => {
      if (!isFavorite(codeId)) {
        const newFavorite: Favorite = {
          codeId,
          createdAt: new Date().toISOString(),
        };
        await saveFavorites([newFavorite, ...favorites]);
      }
    },
    [favorites, isFavorite]
  );

  const removeFavorite = useCallback(
    async (codeId: string) => {
      const newFavorites = favorites.filter((f) => f.codeId !== codeId);
      await saveFavorites(newFavorites);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (codeId: string) => {
      if (isFavorite(codeId)) {
        await removeFavorite(codeId);
      } else {
        await addFavorite(codeId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
