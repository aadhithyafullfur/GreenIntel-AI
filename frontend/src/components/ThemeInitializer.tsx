import React, { useLayoutEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeInitializer: React.FC = () => {
  const { theme } = useTheme();

  // useLayoutEffect runs synchronously after DOM updates but before the browser paints,
  // preventing layout shift and theme flicker.
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  return null;
};

export default ThemeInitializer;
