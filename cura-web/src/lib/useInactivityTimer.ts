import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;

export function useInactivityTimer(timeoutMs: number, onTimeout: () => void) {
  const cbRef = useRef(onTimeout);
  cbRef.current = onTimeout;

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const reset = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => cbRef.current(), timeoutMs);
    };

    reset();
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));

    return () => {
      if (timerId) clearTimeout(timerId);
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [timeoutMs]);
}
