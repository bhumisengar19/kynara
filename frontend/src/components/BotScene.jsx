import React, { useState } from "react"
import { SplineScene } from "./ui/splite";
import { Card } from "./ui/card"
import { Bot, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function BotScene({ onInitialize }) {
    const { theme } = useTheme();
    const [splineError, setSplineError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            await onInitialize();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`w-full h-[600px] relative overflow-hidden border-none shadow-none flex flex-col items-center justify-center bg-transparent`}>
            {/* Spotlight effect */}
            <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-gradient-to-b from-kynaraDark-lavender/5 to-transparent' : 'bg-gradient-to-b from-kynaraLight-pink/10 to-transparent'}`} />

            <div className="relative w-full h-[350px] flex items-center justify-center">
                {!splineError ? (
                    <div className="w-full h-full bot-glow">
                        <SplineScene
                            scene="https://prod.spline.design/ATInS8vP7mUmvE0S/scene.splinecode"
                            className="w-full h-full"
                            onLoadError={() => setSplineError(true)}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center animate-float">
                        <div className={`p-8 rounded-full ${theme === 'dark' ? 'bg-kynaraDark-lavender/10 text-kynaraDark-lavender shadow-neon' : 'bg-kynaraLight-pink/20 text-kynaraLight-text shadow-glass'}`}>
                            <Bot size={80} strokeWidth={1.5} />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Sparkles className="text-kynaraDark-lavender animate-twinkle" size={16} />
                            <span className={`text-xs opacity-50 font-medium ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`}>Neural Presence Active</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 text-center px-8 pb-12 mt-4 space-y-4">
                <h1 className={`text-4xl md:text-6xl font-black tracking-tighter ${theme === 'dark' ? 'text-white drop-shadow-sm' : 'text-kynaraLight-text'}`}>
                    Welcome to <span className={theme === 'dark' ? 'text-kynaraDark-lavender' : 'text-kynaraLight-pink'}>Kynara</span>
                </h1>
                <p className={`max-w-md mx-auto font-medium opacity-70 leading-relaxed text-sm ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`}>
                    Your cosmic companion for intelligent conversations.
                    Ready to explore the infinite possibilities of AI with you.
                </p>

                <div className="pt-4">
                    <button
                        onClick={handleClick}
                        disabled={loading}
                        className={`px-12 py-4 font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative z-[100] pointer-events-auto cursor-pointer ${theme === 'dark'
                            ? 'bg-gradient-to-r from-kynaraDark-lavender to-kynaraDark-violet text-white shadow-kynaraDark-lavender/30'
                            : 'bg-gradient-to-r from-kynaraLight-pink to-kynaraLight-lavender text-kynaraLight-text shadow-kynaraLight-pink/20'
                            }`}>
                        {loading ? 'Initializing Interface...' : 'Initialize Connection'}
                    </button>
                </div>
            </div>
        </Card>
    )
}


