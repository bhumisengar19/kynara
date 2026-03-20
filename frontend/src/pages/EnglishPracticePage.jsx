import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Mic, MicOff, Volume2, Trophy, AlertCircle, BookOpen, ArrowLeft, History, Zap, Sparkles, Brain, Layout, BarChart, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AvatarModel } from '../components/FloatingAvatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

// --- Production Level Voice Waveform Component ---
const VoiceWaveform = ({ active }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const bars = 20;
        const barWidth = 4;
        const barGap = 4;
        const heights = new Array(bars).fill(10);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6366f1';
            for (let i = 0; i < bars; i++) {
                heights[i] = Math.max(5, Math.random() * (active ? 40 : 10));
                const x = i * (barWidth + barGap);
                const y = (canvas.height - heights[i]) / 2;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, heights[i], 2);
                ctx.fill();
            }
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [active]);

    return <canvas ref={canvasRef} width={160} height={60} className="opacity-80" />;
};

export default function EnglishPracticePage() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [status, setStatus] = useState('online');
    const [transcript, setTranscript] = useState("");
    const [mistakes, setMistakes] = useState(() => {
        const saved = localStorage.getItem('kynara_coach_mistakes');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentChatId, setCurrentChatId] = useState(null);
    const [lastFeedback, setLastFeedback] = useState(null);
    const [dailyCalls, setDailyCalls] = useState(() => {
        const saved = localStorage.getItem('kynara_coach_calls');
        const today = new Date().toDateString();
        if (saved) {
            const data = JSON.parse(saved);
            if (data.date === today) return data.count;
        }
        return 0;
    });

    const utteranceRef = useRef(null);
    const recognitionRef = useRef(null);
    const limitReached = dailyCalls >= 15;

    // --- Persistence & Initialization ---
    useEffect(() => {
        localStorage.setItem('kynara_coach_mistakes', JSON.stringify(mistakes));
    }, [mistakes]);

    useEffect(() => {
        const today = new Date().toDateString();
        localStorage.setItem('kynara_coach_calls', JSON.stringify({ date: today, count: dailyCalls }));
    }, [dailyCalls]);

    useEffect(() => {
        const initSession = async () => {
            try {
                const res = await api.post("/chat/new", { 
                    greeting: "I'm Kynara, your dedicated English Coach. We have a 15-interaction daily limit to keep our focus sharp. Ready to start?" 
                });
                setCurrentChatId(res.data._id);
                speakResponse("I'm Kynara, your dedicated English Coach. Ready to start our session?");
            } catch (err) {
                console.error("Failed to start session:", err);
            }
        };
        initSession();
        return () => window.speechSynthesis.cancel();
    }, []);

    // --- Voice Logic ---
    const speakResponse = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural')));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        setTimeout(() => window.speechSynthesis.speak(utterance), 500); // Thinking delay
    };

    const handleVoiceInput = () => {
        if (limitReached) return;
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Browser not supported");

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript("");
        };
        recognition.onresult = (e) => setTranscript(e.results[0][0].transcript);
        recognition.onend = () => {
            setIsListening(false);
            if (transcript.trim()) submitToCoach(transcript);
        };
        recognition.start();
    };

    const submitToCoach = async (text) => {
        if (limitReached || !currentChatId) return;
        setStatus('thinking');
        
        try {
            const res = await api.post("/chat/send", {
                message: text,
                chatId: currentChatId,
                englishMode: true
            });

            const { reply } = res.data;
            setDailyCalls(prev => prev + 1);

            // Single API call robust parsing
            const corr = (reply.match(/CORRECTION:\s*(.*?)(?=\n|EXPLANATION:|$)/i) || [])[1]?.trim();
            const expl = (reply.match(/EXPLANATION:\s*(.*?)(?=\n|SCORE:|$)/i) || [])[1]?.trim();
            const score = (reply.match(/SCORE:\s*(.*?)(?=\n|HIGHLIGHTS:|$)/i) || [])[1]?.trim();
            const highlights = (reply.match(/HIGHLIGHTS:\s*(.*?)(?=\n|REPLY:|$)/i) || [])[1]?.trim();
            const ttsReply = (reply.match(/REPLY:\s*([\s\S]*)$/i) || [])[1]?.trim() || reply;

            const feedback = {
                id: Date.now(),
                wrong: text,
                correct: corr || "Perfect!",
                explanation: expl || "",
                score: parseInt(score) || 85,
                highlights: highlights || ""
            };

            setLastFeedback(feedback);
            if (corr && !corr.includes('Perfect')) {
                setMistakes(prev => [feedback, ...prev]);
            }

            speakResponse(ttsReply);
            setStatus('online');
        } catch (err) {
            console.error(err);
            setStatus('online');
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#050508]' : 'bg-slate-50'}`}>
            
            {/* --- Premium Header --- */}
            <header className="flex items-center justify-between p-6 border-b border-white/5 backdrop-blur-3xl bg-black/20 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/chat')} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/70">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
                           KYNARA <span className="text-indigo-500">COACH</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className={`w-3 h-1 rounded-full ${dailyCalls >= i * 3 ? 'bg-indigo-500' : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                Session Limit: {dailyCalls}/15
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Fluency Score</p>
                        <p className="text-xl font-black text-white">{lastFeedback?.score || (mistakes.length > 0 ? 78 : '--')}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <BarChart size={20} />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex relative">
                
                {/* --- Left Context Sidebar --- */}
                <aside className="w-20 lg:w-64 border-r border-white/5 backdrop-blur-xl bg-black/10 hidden md:flex flex-col p-4">
                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                                <History size={12} /> Recent Stats
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/60">Mistakes</span>
                                    <span className="text-xs font-bold text-red-400">{mistakes.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/60">Perfects</span>
                                    <span className="text-xs font-bold text-emerald-400">{dailyCalls - mistakes.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* --- Center Focus: The Avatar --- */}
                <main className="flex-1 relative flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
                    
                    <div className="w-full h-full max-h-[60vh] relative">
                         <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
                            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
                            <ambientLight intensity={0.5} />
                            <spotLight position={[10, 10, 10]} intensity={2} angle={0.15} penumbra={1} castShadow />
                            <Environment preset="city" />
                            <AvatarModel isSpeaking={isSpeaking} isListening={isListening} status={status} />
                            <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={6} blur={2.5} far={4} />
                        </Canvas>
                    </div>

                    {/* --- Interaction Dock --- */}
                    <div className="w-full max-w-2xl px-8 pb-12 flex flex-col items-center gap-8 relative z-10">
                        
                        <AnimatePresence>
                            {isListening && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                                    <VoiceWaveform active={true} />
                                    <p className="mt-4 text-white/90 text-lg font-medium tracking-tight italic">"{transcript || "Listening..."}"</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* --- Main Mic Button --- */}
                        <div className="relative group">
                            {limitReached ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                                        <XCircle size={32} />
                                    </div>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Daily Limit Reached</p>
                                </div>
                            ) : (
                                <motion.button 
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={handleVoiceInput}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                                        isListening ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-indigo-600 text-white shadow-indigo-600/40 group-hover:bg-indigo-500'
                                    }`}
                                >
                                    <div className={`absolute inset-0 rounded-full border-4 border-indigo-400/20 ${isListening ? 'animate-ping' : ''}`} />
                                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                                </motion.button>
                            )}
                        </div>

                        {!isListening && !limitReached && (
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Tap to Start Speaking</p>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-white/60">
                                    <Sparkles size={12} className="text-indigo-400" /> Neural Language Engine Active
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- Live Feedback Toast --- */}
                    <AnimatePresence>
                        {lastFeedback && (
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                                className={`absolute left-8 bottom-32 p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl max-w-sm ${
                                    lastFeedback.correct.includes('Perfect') ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lastFeedback.correct.includes('Perfect') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {lastFeedback.correct.includes('Perfect') ? <Trophy size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                    <p className="text-white text-sm font-bold">{lastFeedback.correct.includes('Perfect') ? 'Spotless Grammar' : 'Correction Applied'}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* --- Right Sidebar: Learning Notes --- */}
                <aside className="w-[420px] border-l border-white/5 backdrop-blur-3xl bg-black/40 flex flex-col">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-black tracking-tight text-lg">Mistake Notes</h3>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Grammar & Phrasing</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <AnimatePresence mode='popLayout'>
                            {mistakes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-12 opacity-20 text-center">
                                    <Brain size={64} className="mb-6" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No mistakes yet. Let's start the conversation!</p>
                                </div>
                            ) : (
                                mistakes.map((m, idx) => (
                                    <motion.div key={m.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                        className="bg-white/[0.03] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.06] transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl pointer-events-none" />
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Record #{mistakes.length - idx}</span>
                                            <div className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{m.score}%</div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-red-500/40 tracking-wider mb-2">Wrong Phrasing</p>
                                                <p className="text-sm text-white/80 line-through decoration-red-500/50">{m.wrong}</p>
                                            </div>
                                            
                                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/10">
                                                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-2">Natural Correction</p>
                                                <p className="text-sm text-white font-bold leading-relaxed">{m.correct}</p>
                                            </div>

                                            {m.explanation && (
                                                <div className="flex gap-2">
                                                    <div className="w-1 h-auto bg-white/10 rounded-full" />
                                                    <p className="text-[12px] text-white/50 leading-relaxed italic">
                                                        <span className="text-indigo-400 font-bold not-italic">Coach's Tip:</span> {m.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-white">Session Session Summary</span>
                            <span className="text-xs text-white/40">Today</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Fluency</p>
                                <p className="text-lg font-black text-white">82%</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Call usage</p>
                                <p className="text-lg font-black text-white">{dailyCalls}/15</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
