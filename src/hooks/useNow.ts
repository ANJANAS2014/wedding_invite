import { useEffect, useState } from 'react';

/** Current time in ms, refreshed every `intervalMs` (drives live countdowns). */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
