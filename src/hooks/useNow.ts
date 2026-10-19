import { useEffect, useState } from "react";

const MINUTE_MS = 60 * 1000;

export function useNow(intervalMs = MINUTE_MS): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
