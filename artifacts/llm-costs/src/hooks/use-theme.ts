import { useEffect } from 'react';
import { useStoredState } from './use-stored-state';

type Theme = 'dark' | 'light';
const isTheme = (value: unknown): value is Theme => value === 'dark' || value === 'light';

export function useTheme() {
  const [theme, setTheme] = useStoredState<Theme>('ts:theme', 'dark', isTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'dark' ? '#090d16' : '#f8fafc',
    );
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark') };
}
