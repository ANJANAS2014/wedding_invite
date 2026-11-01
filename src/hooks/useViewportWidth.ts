import { useEffect, useState } from 'react';

/**
 * window.innerWidth, kept current on resize. Starts at a desktop default so
 * layout maths is never 0 before the first measurement.
 */
export function useViewportWidth(initial = 1024): number {
  const [width, setWidth] = useState<number>(initial);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}
