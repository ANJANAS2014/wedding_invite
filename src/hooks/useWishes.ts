import { useCallback, useEffect, useRef, useState } from 'react';
import type { WishRecord } from '../types';
import { loadStoredLikes, loadWishes, saveStoredLikes, type StoredLikes } from '../services/wishesService';

/**
 * Wishes Wall data: loads (and reloads when `refreshKey` changes) the wish
 * list, and manages this browser's likes (persisted to localStorage only).
 */
const sameWish = (a: WishRecord, b: WishRecord): boolean =>
  a.wish.trim().toLowerCase() === b.wish.trim().toLowerCase() &&
  a.displayName.trim().split(/\s+/)[0].toLowerCase() === b.displayName.trim().split(/\s+/)[0].toLowerCase();

/** Puts the guest's just-sent wish at the front unless the server list already has it. */
const withPending = (list: WishRecord[], pending: WishRecord | null | undefined): WishRecord[] =>
  pending && !list.some((w) => w.id === pending.id || sameWish(w, pending)) ? [pending, ...list] : list;

export function useWishes(refreshKey: number, pendingWish?: WishRecord | null) {
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [likes, setLikes] = useState<StoredLikes>(() => ({ userLiked: {}, counts: {} }));
  const pendingRef = useRef<WishRecord | null | undefined>(pendingWish);
  pendingRef.current = pendingWish;

  // Show a just-sent wish straight away, without waiting for the server.
  useEffect(() => {
    if (pendingWish) setWishes((prev) => withPending(prev, pendingWish));
  }, [pendingWish]);

  useEffect(() => {
    let cancelled = false;
    // Only the first load shows the skeleton; later refreshes update in place.
    if (refreshKey === 0) setIsLoading(true);
    setLikes(loadStoredLikes());
    loadWishes()
      .then((list) => {
        if (!cancelled) setWishes(withPending(list, pendingRef.current));
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
