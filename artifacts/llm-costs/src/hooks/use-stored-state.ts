import { useEffect, useState } from 'react';

function read<T>(key: string, fallback: T, validate: (v: unknown) => v is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** Estado persistido em localStorage, validado na restauração e tolerante a falhas. */
export function useStoredState<T>(key: string, fallback: T, validate: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => read(key, fallback, validate));
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento indisponível */ }
  }, [key, value]);
  return [value, setValue] as const;
}

export const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length < 5000 && v.every((x) => typeof x === 'string' && x.length < 300);

export const isShortString = (v: unknown): v is string => typeof v === 'string' && v.length <= 40;
