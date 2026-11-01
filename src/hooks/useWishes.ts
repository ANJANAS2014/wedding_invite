import { useCallback, useEffect, useState } from 'react';
import type { WishRecord } from '../types';
import { loadStoredLikes, loadWishes, saveStoredLikes, type StoredLikes } from '../services/wishesService';

/**
 * Wishes Wall data: loads (and reloads when `refreshKey` changes) the wish
 * list, and manages this browser's likes (persisted to localStorage only).
 */
export function useWishes(refreshKey: number) {
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [likes, setLikes] = useState<StoredLikes>(() => ({ userLiked: {}, counts: {} }));

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLikes(loadStoredLikes());
    loadWishes()
      .then((list) => {
        if (!cancelled) setWishes(list);
      })
      .catch(() => {
        // keep the previous list
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  /** Toggles this browser's like; returns the count delta (+1 / -1). */
  const toggleLike = useCallback(
    (wishId: string): number => {
      const isLiked = !!likes.userLiked[wishId];
      const diff = isLiked ? -1 : 1;
      const next: StoredLikes = {
        userLiked: { ...likes.userLiked, [wishId]: !isLiked },
        counts: { ...likes.counts, [wishId]: (likes.counts[wishId] || 0) + diff },
      };
      setLikes(next);
      saveStoredLikes(next);
      setWishes((prev) =>
        prev.map((w) => (w.id === wishId ? { ...w, likesCount: Math.max(0, w.likesCount + diff) } : w))
      );
      return diff;
    },
    [likes]
  );

  const isLiked = useCallback((wishId: string) => !!likes.userLiked[wishId], [likes]);

  return { wishes, isLoading, isLiked, toggleLike };
}
