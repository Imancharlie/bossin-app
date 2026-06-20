import { useMemo, useCallback, useRef } from 'react';

// Memoization hook for expensive computations
export function useMemoized<T>(factory: () => T, deps: any[]) {
  return useMemo(factory, deps);
}

// Memoized callback hook
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
) {
  return useCallback(callback, deps);
}

// Debounce hook for performance optimization
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<any>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        callback(...args);
        lastRunRef.current = now;
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

// Cache hook for storing computed values
export function useCache<T>(key: string, factory: () => T, deps: any[]): T {
  const cacheRef = useRef<Map<string, T>>(new Map());

  return useMemo(() => {
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }
    const value = factory();
    cacheRef.current.set(key, value);
    return value;
  }, [key, ...deps]);
}
