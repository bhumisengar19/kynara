import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'glass', icon: Sparkles, label: 'Glass' },
        { id: 'dark', icon: Zap, label: 'Futuristic' },
    ];

    return (
        <div className="flex bg-purple-50/50 dark:bg-dark-secondary rounded-[20px] p-1.5 shadow-inner border border-purple-100 dark:border-white/5 relative">
            {themes.map((t) => {
                const isActive = theme === t.id;
                const Icon = t.icon;

                return (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`relative flex items-center justify-center w-11 h-11 rounded-[16px] transition-all ${isActive ? 'text-purple-600' : 'text-purple-300 hover:text-purple-500'
                            }`}
                        aria-label={`Switch to ${t.label} mode`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTheme"
                                className="absolute inset-0 bg-white dark:bg-purple-900/30 rounded-[14px] shadow-sm"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            />
                        )}
                        <span className="relative z-10 transition-transform hover:scale-110">
                            <Icon size={20} />
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeToggle;
