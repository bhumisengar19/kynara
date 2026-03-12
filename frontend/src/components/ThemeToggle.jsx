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
        <div className={`flex backdrop-blur-2xl rounded-full p-1 shadow-xl border ${theme === 'dark' ? 'bg-kynaraDark-navy/50 border-white/10' : 'bg-kynaraLight-bg/50 border-kynaraLight-lavender'
            }`}>
            {themes.map((t) => {
                const isActive = theme === t.id;
                const Icon = t.icon;

                return (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${isActive
                                ? theme === 'dark' ? 'text-kynaraDark-lavender' : 'text-kynaraLight-text'
                                : 'opacity-40 hover:opacity-100'
                            }`}
                        aria-label={`Switch to ${t.label} mode`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTheme"
                                className={`absolute inset-0 rounded-full shadow-inner ${theme === 'dark' ? 'bg-white/10' : 'bg-white/80'
                                    }`}
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
