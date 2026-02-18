import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
    ];

    return (
        <div className="flex bg-white/20 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/30">
            {themes.map((t) => {
                const isActive = theme === t.id;
                const Icon = t.icon;

                return (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isActive ? 'text-accent-deepPurple' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        aria-label={`Switch to ${t.label} mode`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTheme"
                                className="absolute inset-0 bg-white/80 dark:bg-white/10 rounded-full shadow-sm"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">
                            <Icon size={18} />
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeToggle;
