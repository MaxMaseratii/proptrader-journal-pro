import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Always use dark theme as the only option
    return 'dark';
  });

  useEffect(() => {
    // Always apply dark theme as the only option
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    
    // Store dark theme in localStorage
    localStorage.setItem('prop-journal-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Dark theme is the only option, no toggling
    return;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}