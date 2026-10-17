import { useEffect, useState } from "react";

/**
 * Retorna `value` somente depois que ele ficar `delay` ms sem mudar.
 * Usado na busca para disparar a requisição quando a pessoa para de digitar (decisão 004).
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
