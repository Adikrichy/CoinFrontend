import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const useTheme = () => {
    // Читаем тему из localStorage или из system preferences
    const getInitialTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved !== null) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme:dark)').matches;
    };

    const [isDarkMode, setDarkMode] = useState(getInitialTheme);

    const toggleTheme = () => {
        setDarkMode(prev => {
            localStorage.setItem('theme', !prev ? 'dark' : 'light');
            return !prev;
        });
    };

    // Сохраняем тему при изменении
    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return [isDarkMode, toggleTheme];
};