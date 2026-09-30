import { useState, useEffect } from "react";

// Возвращает значение с задержкой: обновляется только после паузы delay мс
export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
