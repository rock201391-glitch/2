import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

interface ThemeRow { key: string; value: string }

const DEFAULTS: Record<string, string> = {
  'color-primary':    '#0F3A2B',
  'color-secondary':  '#2F6B4E',
  'color-background': '#F8F7F2',
  'color-button':     '#0F3A2B',
  'color-text':       '#0F3A2B',
  'color-border':     '#D8D2C5',
  'color-card':       '#FFFFFF',
  'border-radius':    '1rem',
  'shadow-style':     'soft',
  'font-family':      'inherit',
  'font-size-base':   '16px',
};

interface ThemeContextValue {
  theme: Record<string, string>;
  reload: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULTS,
  reload: async () => {},
});

export function ThemeSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Record<string, string>>(DEFAULTS);

  const applyVars = (t: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(t).forEach(([k, v]) => {
      root.style.setProperty(`--theme-${k}`, v);
    });
  };

  const load = async () => {
    try {
      const { data } = await supabase
        .from('theme_settings')
        .select('key, value');
      if (data && data.length > 0) {
        const merged = { ...DEFAULTS };
        (data as ThemeRow[]).forEach(row => { merged[row.key] = row.value; });
        setTheme(merged);
        applyVars(merged);
      } else {
        applyVars(DEFAULTS);
      }
    } catch {
      applyVars(DEFAULTS);
    }
  };

  useEffect(() => {
    applyVars(DEFAULTS); // apply defaults immediately, no flash
    load();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, reload: load }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSettings() {
  return useContext(ThemeContext);
}
