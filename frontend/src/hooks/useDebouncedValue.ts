import { useEffect, useState } from "react";

/**
 * Returns `value`, but delayed by `delayMs` after the last change — used to
 * avoid firing a server request on every keystroke in a search box. The
 * caller keeps rendering the *live* input value (so typing never feels
 * laggy); only the value used to trigger a fetch should read the debounced
 * one.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
