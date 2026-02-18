
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        // Remove all previous theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-glass');
        root.classList.remove('dark');

        // Apply new theme
        body.classList.add(`theme-${theme}`);
        localStorage.setItem('theme', theme);

        // Coordinate with Tailwind's dark mode
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // For "glass" theme, we might default to light mode text/variables in Tailwind unless specified otherwise,
        // but the CSS handles the specific glass background overrides.

    }, [theme]);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
