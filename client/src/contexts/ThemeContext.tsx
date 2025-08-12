import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if we're on the welcome page
    const isWelcomePage = window.location.pathname === '/welcome' || window.location.pathname === '/';
    
    if (isWelcomePage) {
      return 'dark'; // Welcome page always starts dark
    }
    
    // For other pages, check localStorage or default to light
    const saved = localStorage.getItem('prop-journal-theme') as Theme | null;
    return saved || 'light';
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Only save theme preference for non-welcome pages
    const isWelcomePage = window.location.pathname === '/welcome' || window.location.pathname === '/';
    if (!isWelcomePage) {
      localStorage.setItem('prop-journal-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
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