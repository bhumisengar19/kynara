import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Mic, MicOff, Volume2, Trophy, AlertCircle, BookOpen, ArrowLeft, History, Zap, Award, Star, Download, Linkedin, Share2, X, ChevronRight, CheckCircle2, Lock, Settings, Briefcase, ShoppingBag, Plane, Coffee, Users, Target, BarChart3, Brain, Sparkles, RefreshCcw, Stethoscope, Utensils, Timer, Shield, Swords, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AvatarModel } from '../components/FloatingAvatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

// Badge Definitions
const ALL_BADGES = [
    { id: 'first_step', name: 'First Step', desc: 'Complete 1 practice session', icon: <Award className="text-blue-400" />, requirement: (s) => s.count >= 1 },
    { id: 'on_fire', name: 'On Fire', desc: 'Maintain a 3-day streak', icon: <Zap className="text-orange-500" />, requirement: (s) => s.streak >= 3 },
    { id: 'level_master', name: 'Rising Star', desc: 'Reach Level 2 (Intermediate)', icon: <Star className="text-yellow-400" />, requirement: (s) => s.xp >= 100 },
    { id: 'perfect_ten', name: 'Perfect Ten', desc: 'Get a x10 combo', icon: <CheckCircle2 className="text-emerald-400" />, requirement: (s) => (s.maxCombo || 0) >= 10 },
    { id: 'legend', name: 'AI Legend', desc: 'Reach 1000 XP', icon: <Trophy className="text-purple-400" />, requirement: (s) => s.xp >= 1000 },
];

export default function EnglishPracticePage() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [status, setStatus] = useState('online');
    const [transcript, setTranscript] = useState("");
    const [mistakes, setMistakes] = useState([]);
    const [sessionMessages, setSessionMessages] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [lastCorrection, setLastCorrection] = useState(null);
    const [dailyLimitReached, setDailyLimitReached] = useState(false);
    const [usageCount, setUsageCount] = useState(0);
    
    // Gamification State
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [level, setLevel] = useState("Beginner");
    const [combo, setCombo] = useState(0);
    const [progress, setProgress] = useState(0); // Daily Goal progress
    const [showReward, setShowReward] = useState(null); // { type, amount }
    const [showBadges, setShowBadges] = useState(false);
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'history'
    const [streakWarning, setStreakWarning] = useState(null); // Notification banner
    
    // NEW POWER COACH STATES
    const [configMode, setConfigMode] = useState(true); // Initial configuration screen
    const [personality, setPersonality] = useState('friendly'); // friendly, strict, mentor
    const [scenario, setScenario] = useState('casual'); // interview, shopping, travel, casual, presentation
    const [difficulty, setDifficulty] = useState('intermediate');
    const [analytics, setAnalytics] = useState({
        accuracy: 0,
        fluency: 0,
        grammarScore: 0,
        vocabScore: 0,
        pronunciationScore: 0,
        totalMistakes: 0,
        topWeakness: "None yet",
        fillersCount: 0,
        confidence: 0
    });
    const [trainingMode, setTrainingMode] = useState('conversation'); // conversation, shadowing, thinkfast, mocktest
    const [timer, setTimer] = useState(null);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [weakAreas, setWeakAreas] = useState([]);
    const [isRepeating, setIsRepeating] = useState(false); // For Repeat & Improve mode
    const [targetSentence, setTargetSentence] = useState("");
    
    const PERSONALITIES = [
        { id: 'friendly', name: 'Friendly Coach', icon: '😊', desc: 'Encouraging and supportive feedback', color: 'text-emerald-400' },
        { id: 'strict', name: 'Strict Teacher', icon: '👨‍🏫', desc: 'Focus on precision and hard rules', color: 'text-rose-400' },
        { id: 'mentor', name: 'Professional Mentor', icon: '💼', desc: 'Business-focused, career-ready advice', color: 'text-indigo-400' }
    ];

    const SCENARIOS = [
        { id: 'casual', name: 'Casual Talk', icon: <Coffee size={20} />, prompt: "Let's have a relaxed chat about your day or interests." },
        { id: 'interview', name: 'Job Interview', icon: <Briefcase size={20} />, prompt: "I'll be your interviewer. We are meeting for a position you applied for." },
        { id: 'shopping', name: 'Shopping', icon: <ShoppingBag size={20} />, prompt: "You are at a premium store and need help with your purchase." },
        { id: 'travel', name: 'Travel & Booking', icon: <Plane size={20} />, prompt: "You are at the airport or checking into a hotel." },
        { id: 'presentation', name: 'Oral Presentation', icon: <Users size={20} />, prompt: "You are presenting a new idea to a board of directors." },
        { id: 'doctor', name: 'Doctor / Health', icon: <Stethoscope size={20} />, prompt: "I am your doctor. Please explain what happened and how you are feeling." },
        { id: 'restaurant', name: 'Restaurant', icon: <Utensils size={20} />, prompt: "I am your waiter. What can I get for you today?" }
    ];
    
    const recognitionRef = useRef(null);
    const utteranceRef = useRef(null);
    const scrollRef = useRef(null);
    const audioContextRef = useRef(null);
    const analystRef = useRef(null);

    // DAILY STATS & GAMIFICATION LOGIC
    useEffect(() => {
        const today = new Date().toDateString();
        const stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v2') || '{}');
        
        if (!stored.date) {
            // First time initialization
            const initial = { 
                date: today, 
                count: 0, 
                xp: 0, 
                streak: 0, 
                lastActive: "", 
                sentencesToday: 0 
            };
            localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(initial));
            return;
        }

        // Streak check (Timestamp based)
        const now = Date.now();
        const lastActiveTime = stored.lastActiveTime || 0;
        let currentStreak = stored.streak || 0;
        
        // Reset if missed more than 48 hours
        if (lastActiveTime > 0 && (now - lastActiveTime) > (48 * 60 * 60 * 1000)) {
            currentStreak = 0;
            stored.streak = 0;
            localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(stored));
        } else if (lastActiveTime > 0 && (now - lastActiveTime) > (36 * 60 * 60 * 1000)) {
            // Warn if between 36 and 48 hours (last 12 hours of the streak)
            setStreakWarning(`🔥 Your ${currentStreak}-day streak is about to end! Practice now to save it!`);
            
            // Try browser push notification if permitted
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Kynara Coach", {
                    body: `Your ${currentStreak}-day streak is AT RISK! ⚠️ Practice now to keep the fire alive.`,
                    icon: "/favicon.ico"
                });
            } else if ("Notification" in window) {
                Notification.requestPermission();
            }
        }

        // Reset sentences if new day
        if (stored.date !== today) {
            stored.date = today;
            stored.count = 0;
            stored.sentencesToday = 0;
            localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(stored));
        }

        setXp(stored.xp || 0);
        setStreak(currentStreak);
        setUsageCount(stored.count || 0);
        setProgress(stored.sentencesToday || 0);
        setEarnedBadges(stored.badges || []);
        
        // Re-check badge earnings
        checkBadges(stored);

        if (stored.count >= 15) setDailyLimitReached(true);
        calculateLevel(stored.xp || 0);
    }, []);

    const checkBadges = (stats) => {
        const newlyEarned = [];
        const currentBadges = stats.badges || [];
        
        ALL_BADGES.forEach(badge => {
            if (!currentBadges.includes(badge.id) && badge.requirement(stats)) {
                newlyEarned.push(badge.id);
            }
        });

        if (newlyEarned.length > 0) {
            const updatedBadges = [...currentBadges, ...newlyEarned];
            const updated = { ...stats, badges: updatedBadges };
            localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(updated));
            setEarnedBadges(updatedBadges);
            setShowReward({ type: "Badge Unlocked!", amount: newlyEarned.length });
        }
    };

    const awardXP = (amount, type = "XP") => {
        const stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v2') || '{}');
        const newXp = (stored.xp || 0) + amount;
        const now = Date.now();
        const lastActiveTime = stored.lastActiveTime || 0;
        
        // Only increment if at least 20 hours have passed (buffer for "daily" practice)
        if (now - lastActiveTime >= 20 * 60 * 60 * 1000) {
            stored.streak = (stored.streak || 0) + 1;
            stored.lastActiveTime = now;
            setStreak(stored.streak);
        }

        stored.xp = newXp;
        stored.lastActive = today; 
        localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(stored));
        
        setXp(newXp);
        calculateLevel(newXp);
        checkBadges(stored);
        setShowReward({ type, amount });
        setTimeout(() => setShowReward(null), 2500);
    };

    const handleSentenceGamify = (isCorrect) => {
        const stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v2') || '{}');
        const newProg = (stored.sentencesToday || 0) + 1;
        stored.sentencesToday = newProg;
        
        const newCombo = isCorrect ? combo + 1 : 0;
        setCombo(newCombo);
        
        if (newCombo > (stored.maxCombo || 0)) {
            stored.maxCombo = newCombo;
        }

        localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(stored));
        setProgress(newProg);

        if (isCorrect) {
            awardXP(10 + (newCombo > 2 ? 5 : 0), newCombo > 2 ? `Combo x${newCombo}!` : "Correct");
        } else {
            awardXP(5, "Attempt");
        }

        if (newProg === 5) {
            awardXP(20, "Daily Goal Met! 🎉");
        }
    };

    const calculateLevel = (currentXp) => {
        if (currentXp >= 700) setLevel("Fluent");
        else if (currentXp >= 300) setLevel("Advanced");
        else if (currentXp >= 100) setLevel("Intermediate");
        else setLevel("Beginner");
    };

    const incrementUsage = () => {
        const stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v2') || '{}');
        stored.count = (stored.count || 0) + 1;
        localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(stored));
        setUsageCount(stored.count);
        if (stored.count >= 15) setDailyLimitReached(true);
    };

    const downloadBadge = (badge) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Draw Premium Background
        const grad = ctx.createRadialGradient(300, 300, 0, 300, 300, 400);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(1, '#050508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);

        // Draw Glowing Ring
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(300, 300, 250, 0, Math.PI * 2);
        ctx.stroke();

        // Icon placeholder (simple star/award for downloaded image)
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', 300, 280);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(badge.name, 300, 360);
        
        ctx.fillStyle = '#ffffff60';
        ctx.font = '18px sans-serif';
        ctx.fillText('Earned on Kynara AI English Practice', 300, 410);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `Kynara_${badge.id}_Badge.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    // Initialize English Practice Session
    const startSession = async () => {
        try {
            setStatus('thinking');
            setConfigMode(false);
            const activeScenario = SCENARIOS.find(s => s.id === scenario);
            const activePersonality = PERSONALITIES.find(p => p.id === personality);
            
            const initialGreeting = `Hello! I'm your ${activePersonality.name}. ${activeScenario.prompt} I'm ready when you are.`;
            
            const res = await api.post("/chat/new", { 
                greeting: initialGreeting,
                scenario: scenario,
                personality: personality
            });
            setCurrentChatId(res.data._id);
            setSessionMessages(res.data.messages);
            speakResponse(initialGreeting);
            setStatus('online');
        } catch (err) {
            console.error("Failed to start session:", err);
            setStatus('online');
        }
    };

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v3') || '{}');
        setXp(stored.xp || 0);
        calculateLevel(stored.xp || 0);
        setEarnedBadges(stored.badges || []);
        setWeakAreas(stored.weakAreas || []);
        setAnalytics(prev => ({
            ...prev,
            ...stored.lastAnalytics
        }));
        return () => window.speechSynthesis.cancel();
    }, []);

    const speakResponse = (text) => {
        window.speechSynthesis.cancel();
        
        // Clean markdown/labels
        const cleanText = text
            .replace(/CORRECTION:[\s\S]*?EXPLANATION:.*?(\n|$)/i, "")
            .replace(/\*/g, "")
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utterance;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural')));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
    };

    const handleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript("");
        };

        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (transcript.trim()) {
                submitToCoach(transcript);
            }
        };

        recognition.start();
    };

    const submitToCoach = async (text) => {
        if (!currentChatId || dailyLimitReached) return;
        setStatus('thinking');
        incrementUsage();
        
        try {
            // Handle Repeat & Improve comparison
            if (isRepeating) {
                const target = targetSentence.toLowerCase().replace(/[.,!?;:]/g, "");
                const input = text.toLowerCase().replace(/[.,!?;:]/g, "");
                const similarity = input === target ? 100 : 0; // Simple for now
                
                if (similarity === 100) {
                    awardXP(15, "Perfect Sync! 🔥");
                    setSessionMessages(prev => [...prev, 
                        { role: 'user', content: `(Repeating) ${text}` },
                        { role: 'assistant', content: "Perfectly repeated! You have mastered that sentence. Great job!" }
                    ]);
                    speakResponse("Perfectly repeated! You have mastered that sentence.");
                } else {
                    setSessionMessages(prev => [...prev, 
                        { role: 'user', content: `(Repeating) ${text}` },
                        { role: 'assistant', content: `Almost! You said: "${text}". Try one more time to match our target: "${targetSentence}"` }
                    ]);
                    speakResponse("Almost! Give it one more try to match the target.");
                }
                setIsRepeating(false);
                setTargetSentence("");
                setStatus('online');
                return;
            }

            const res = await api.post("/chat/send", {
                message: text,
                chatId: currentChatId,
                englishMode: true,
                scenario,
                personality,
                difficulty
            });

            const { reply } = res.data;
            
            // Advanced Parsing
            const corrMatch = reply.match(/CORRECTION:\s*(.*?)(?=\n|CATEGORY:|$)/i);
            const explMatch = reply.match(/EXPLANATION:\s*(.*?)(?=\n|CATEGORY:|$)/i);
            const catMatch = reply.match(/CATEGORY:\s*(.*?)(?=\n|SCORES:|$)/i);
            const scoresMatch = reply.match(/SCORES:\s*\[Grammar:\s*(\d+)\/100,\s*Vocabulary:\s*(\d+)\/100,\s*Fluency:\s*(\d+)\/100\]/i);

            const correctionText = (corrMatch ? corrMatch[1].trim() : "").replace(/^\"|\"$/g, "");
            const isPerfect = correctionText.toLowerCase().includes('perfect');

            if (scoresMatch) {
                setAnalytics(prev => {
                    const next = {
                        ...prev,
                        grammarScore: parseInt(scoresMatch[1]),
                        vocabScore: parseInt(scoresMatch[2]),
                        fluency: parseInt(scoresMatch[3]),
                        accuracy: Math.round((parseInt(scoresMatch[1]) + parseInt(scoresMatch[2])) / 2)
                    };
                    const stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v3') || '{}');
                    stored.lastAnalytics = next;
                    localStorage.setItem('kynara_coach_stats_v3', JSON.stringify(stored));
                    return next;
                });
            }

            if (!isPerfect && correctionText.length > 2) {
                const newMistake = {
                    id: Date.now(),
                    wrong: text,
                    correction: correctionText,
                    explanation: explMatch ? explMatch[1].trim() : "Improve your sentence structure.",
                    category: catMatch ? catMatch[1].trim() : "Grammar"
                };
                setMistakes(prev => [newMistake, ...prev]);
                setLastCorrection(newMistake);
                handleSentenceGamify(false);
            } else {
                setLastCorrection({ correction: "Perfect Delivery! 🔥" });
                handleSentenceGamify(true);
            }

            let cleanReply = reply.replace(/CORRECTION:[\s\S]*?SCORES:.*?(\n\n|\n|$)/i, "").trim();
            if (!cleanReply) cleanReply = isPerfect ? "Exactly! Your phrasing was excellent." : "I've noted that correction for you. Shall we continue?";

            setSessionMessages(prev => [...prev, 
                { role: 'user', content: text },
                { role: 'assistant', content: cleanReply }
            ]);
            
            speakResponse(cleanReply);
            setStatus('online');
            setTranscript("");
        } catch (err) {
            console.error("Session Submit Error:", err);
            setStatus('online');
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#050508]' : 'bg-slate-50'}`}>
            
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-white/5 backdrop-blur-xl bg-black/20 z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/chat')}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/70"
                    >
                        <ArrowLeft size={20} />
                    </button>
            <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            English Practice <Zap className="text-indigo-400 fill-indigo-400/20" size={16} />
                        </h2>
                        <div className="flex items-center gap-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Neural Voice Session</p>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1.5 text-orange-400 text-[11px] font-black uppercase tracking-wider">
                                <motion.span 
                                    animate={{ scale: [1, 1.2, 1] }} 
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >🔥</motion.span> {streak} Day Streak
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Rank: {level}</span>
                            <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/20 text-[10px] font-bold text-indigo-300">
                                {xp} XP
                            </div>
                        </div>
                        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(xp % 100)}%` }}
                                className="h-full bg-indigo-500"
                            />
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowBadges(true)}
                        className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 relative"
                    >
                        <Trophy size={20} />
                        {earnedBadges.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                {earnedBadges.length}
                            </span>
                        )}
                    </motion.button>
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050508] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                {String.fromCharCode(64+i)}
                            </div>
                        ))}
                    </div>
                    <span className="text-[13px] font-medium text-white/60">Live Coaching</span>
                </div>
            </header>

            {/* Streak Warning Banner */}
            <AnimatePresence>
                {streakWarning && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-orange-500/20 border-b border-orange-500/30 backdrop-blur-md px-6 py-2 flex items-center justify-between text-orange-200 text-xs font-bold"
                    >
                        <div className="flex items-center gap-2">
                             <Zap size={14} className="animate-pulse fill-orange-500" />
                             {streakWarning}
                        </div>
                        <button onClick={() => setStreakWarning(null)} className="p-1 hover:bg-white/5 rounded">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Main Content Area */}
            <div className="flex-1 flex relative">
                
                {/* Configuration Overlay */}
                <AnimatePresence>
                    {configMode && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[60] bg-[#050508]/95 backdrop-blur-2xl flex items-center justify-center p-6"
                        >
                            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                                            Setup Your Session <Settings className="text-indigo-400 animate-spin-slow" />
                                        </h2>
                                        <p className="text-white/40">Select your scenario and coach personality to begin.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Select Personality</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {PERSONALITIES.map(p => (
                                                <button 
                                                    key={p.id}
                                                    onClick={() => setPersonality(p.id)}
                                                    className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-4 ${
                                                        personality === p.id 
                                                        ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                                    }`}
                                                >
                                                    <span className="text-2xl">{p.icon}</span>
                                                    <div>
                                                        <p className={`font-bold ${personality === p.id ? 'text-white' : 'text-white/60'}`}>{p.name}</p>
                                                        <p className="text-[10px] text-white/30">{p.desc}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Select Training Mode</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'conversation', name: 'Real Conversations', icon: <Users size={16}/> },
                                                { id: 'shadowing', name: 'Shadowing Flow', icon: <Volume2 size={16}/> },
                                                { id: 'thinkfast', name: 'Think Fast! ⚡', icon: <Timer size={16}/> },
                                                { id: 'mocktest', name: 'Mock Test / Battle', icon: <Trophy size={16}/> }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setTrainingMode(m.id)}
                                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                                                        trainingMode === m.id
                                                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                                                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                                    }`}
                                                >
                                                    {m.icon} <span className="text-[10px] font-black uppercase tracking-widest">{m.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Select Difficulty</p>
                                        <div className="flex gap-2">
                                            {['beginner', 'intermediate', 'advanced'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setDifficulty(level)}
                                                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                        difficulty === level
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                                        : 'bg-white/5 border-white/5 text-white/30 hover:text-white/60'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Select Practice Scenario</p>
                                        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                            {SCENARIOS.map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => setScenario(s.id)}
                                                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 ${
                                                        scenario === s.id 
                                                        ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                                    }`}
                                                >
                                                    <div className={`${scenario === s.id ? 'text-emerald-400' : 'text-white/40'}`}>
                                                        {s.icon}
                                                    </div>
                                                    <p className={`font-bold text-xs ${scenario === s.id ? 'text-white' : 'text-white/60'}`}>{s.name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={startSession}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 group"
                                        >
                                            Start Training Session <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </div>

                                    <div className="flex items-center justify-around p-4 bg-white/5 rounded-2xl">
                                        <div className="text-center">
                                            <p className="text-[10px] text-white/30 font-bold uppercase mb-1">XP Bonus</p>
                                            <p className="text-sm font-black text-amber-500">+50</p>
                                        </div>
                                        <div className="w-px h-8 bg-white/10" />
                                        <div className="text-center">
                                            <p className="text-[10px] text-white/30 font-bold uppercase mb-1">Difficulty</p>
                                            <p className="text-sm font-black text-white">{difficulty.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Center Panel - The Avatar */}
                <div className="flex-1 relative flex flex-col">
                    <div className="flex-1 w-full relative">
                        {/* 3D Background elements */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent)]" />
                        
                        {/* Interactive Particles Background */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ 
                                        x: Math.random() * 100 + "%", 
                                        y: Math.random() * 100 + "%",
                                        opacity: Math.random() * 0.5 
                                    }}
                                    animate={{ 
                                        y: [null, "100%", "0%"],
                                        x: [null, Math.random() * 100 + "%"],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ 
                                        duration: 20 + Math.random() * 20, 
                                        repeat: Infinity, 
                                        ease: "linear" 
                                    }}
                                    className="absolute w-1 h-1 bg-indigo-400 rounded-full blur-[1px]"
                                />
                            ))}
                        </div>

                        <Canvas style={{ background: 'transparent' }} shadows>
                            <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={35} />
                            <ambientLight intensity={0.4} />
                            <spotLight position={[10, 15, 10]} intensity={2.5} angle={0.15} penumbra={1} castShadow />
                            <pointLight position={[-10, -5, -10]} intensity={1.5} color="#6366f1" />
                            <Environment preset="night" />
                            
                            <AvatarModel 
                                isSpeaking={isSpeaking} 
                                isListening={isListening} 
                                status={status} 
                            />
                            
                            <ContactShadows position={[0, -1.8, 0]} opacity={0.3} scale={8} blur={3} far={4} color="#000000" />
                        </Canvas>

                        {/* Speaking Waveform (under avatar) */}
                        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-64 h-24 flex items-center justify-center gap-1">
                            {isSpeaking && [...Array(32)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        height: [10, Math.random() * 60 + 10, 10],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{ 
                                        duration: 0.3 + Math.random() * 0.4, 
                                        repeat: Infinity 
                                    }}
                                    className="w-1 bg-indigo-400/60 rounded-full"
                                />
                            ))}
                        </div>

                        {/* Speech Feedback Overlay */}
                        <AnimatePresence>
                            {isListening && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-indigo-600/20 backdrop-blur-2xl border border-indigo-500/30 px-8 py-4 rounded-3xl text-white text-lg font-medium shadow-2xl min-w-[300px] text-center"
                                >
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <div className="flex gap-1 h-4 items-center">
                                            {[1,2,3,4,5].map(i => (
                                                <motion.div 
                                                    key={i}
                                                    animate={{ height: [4, 16, 4] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                                    className="w-1 bg-white rounded-full"
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-wider text-indigo-200">Listening...</span>
                                    </div>
                                    <p className="opacity-90">{transcript || "Say something..."}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Latest Correction Notification */}
                        <AnimatePresence>
                            {lastCorrection && (
                                <motion.div 
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute top-10 left-10 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm ${
                                        lastCorrection.status === 'perfect' 
                                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                                        : 'bg-amber-500/10 border-amber-500/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${lastCorrection.status === 'perfect' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {lastCorrection.status === 'perfect' ? <Trophy size={18} /> : <AlertCircle size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">
                                                {lastCorrection.status === 'perfect' ? 'Perfect Grammar!' : 'Coaching Feedback'}
                                            </p>
                                            {lastCorrection.correction && (
                                                <p className="text-sm text-white/70 mt-1 italic">"{lastCorrection.correction}"</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* XP Popup / Reward Notification */}
                        <AnimatePresence>
                            {showReward && (
                                <motion.div 
                                    initial={{ y: 50, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    className="absolute bottom-60 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
                                >
                                    <div className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-xl shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-white/20">
                                        +{showReward.amount} {showReward.type}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Combo Counter */}
                        <AnimatePresence mode='wait'>
                            {combo > 1 && (
                                <motion.div 
                                    key={combo}
                                    initial={{ scale: 0, rotate: -20, x: 100 }}
                                    animate={{ scale: 1, rotate: 0, x: 0 }}
                                    exit={{ scale: 0, opacity: 0, x: 100 }}
                                    className="absolute top-1/2 right-20 -translate-y-1/2 flex flex-col items-center z-50"
                                >
                                    <div className="text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-t from-orange-600 to-yellow-400 drop-shadow-[0_0_20px_rgba(234,88,12,0.5)]">
                                        x{combo}
                                    </div>
                                    <div className="text-white font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Spoken Combo</div>
                                    <motion.div 
                                        animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.5 }}
                                        className="text-3xl mt-2"
                                    >🔥</motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Controls */}
                    <div className="p-12 flex flex-col items-center justify-center gap-6 bg-gradient-to-t from-[#050508] to-transparent z-10">
                        <motion.button 
                            whileHover={{ scale: dailyLimitReached ? 1 : 1.05 }}
                            whileTap={{ scale: dailyLimitReached ? 1 : 0.95 }}
                            onClick={dailyLimitReached ? null : handleVoiceInput}
                            disabled={dailyLimitReached}
                            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] transition-all duration-500 relative ${
                                dailyLimitReached
                                ? 'bg-gray-800 text-white/20 border border-white/5 opacity-50 cursor-not-allowed'
                                : isListening 
                                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                        >
                            {!dailyLimitReached && <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping" style={{ animationDuration: '3s' }} />}
                            {dailyLimitReached ? <MicOff size={40} /> : isListening ? <MicOff size={40} /> : <Mic size={40} />}
                        </motion.button>
                        <div className="absolute inset-x-0 bottom-32 flex flex-col items-center justify-center p-6 z-50 pointer-events-none">
                        <AnimatePresence>
                            {isListening && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="max-w-xl w-full text-center"
                                >
                                    <div className="bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-12 h-1 bg-indigo-500 rounded-full animate-pulse" />
                                        </div>
                                        <p className="text-2xl font-black text-white leading-tight">
                                            {transcript || "Speak clearly now..."}
                                        </p>
                                        <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-indigo-400 animate-pulse">
                                            Kynara is listening...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div className="mt-6 flex flex-col items-center gap-2">
                             <p className={`text-xs font-bold uppercase tracking-widest ${isListening ? 'text-indigo-400' : 'text-white/40'}`}>
                                {dailyLimitReached ? "Daily free limit reached (15/15)" : isListening ? "Stop Speaking" : "Click to start speaking"}
                            </p>
                            <div className="flex items-center gap-2 text-white/20 font-medium text-[10px] uppercase tracking-widest">
                                <Sparkles size={10} /> Auto-processing enabled
                            </div>
                        </div>
                    </div>
                    </div>
                {/* Right Panel - Feedback & History */}
                <aside className="w-96 border-l border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col z-10 transition-all duration-500">
                    <div className="p-8 border-b border-white/5">
                        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl mb-6">
                            {['notes', 'history', 'stats'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab 
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em]">
                                {activeTab === 'notes' ? 'Learning Notes' : 
                                 activeTab === 'stats' ? 'Speaking Analytics' : 'Dialogue Flow'}
                            </h3>
                            <span className="bg-white/5 text-white/40 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                {activeTab === 'notes' ? mistakes.length : 
                                 activeTab === 'stats' ? 'Live' : Math.floor(sessionMessages.length / 2)} Total
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        <AnimatePresence mode='popLayout'>
                            {activeTab === 'stats' ? (
                                <motion.div 
                                    key="stats-view"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-white/30 font-bold uppercase mb-2">Fluency</p>
                                            <p className="text-2xl font-black text-indigo-400">{analytics.fluency}%</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-white/30 font-bold uppercase mb-2">Accuracy</p>
                                            <p className="text-2xl font-black text-emerald-400">{analytics.accuracy}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'Grammar', score: analytics.grammarScore, color: 'bg-blue-500' },
                                            { label: 'Vocabulary', score: analytics.vocabScore, color: 'bg-purple-500' },
                                            { label: 'Pronunciation', score: analytics.pronunciationScore, color: 'bg-rose-500' }
                                        ].map(stat => (
                                            <div key={stat.label} className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold uppercase">
                                                    <span className="text-white/50">{stat.label}</span>
                                                    <span className="text-white">{stat.score}/100</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${stat.score}%` }}
                                                        className={`h-full ${stat.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-300">
                                            <Brain size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Growth AI Focus</span>
                                        </div>
                                        <p className="text-xs text-indigo-200/70 leading-relaxed italic">
                                            "Focus on using more 'connector words' to improve your fluency score."
                                        </p>
                                    </div>
                                </motion.div>
                            ) : activeTab === 'notes' ? (
                                mistakes.length === 0 ? (
                                    <motion.div 
                                        key="empty-notes"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center p-8"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 mb-4">
                                            <BookOpen size={32} />
                                        </div>
                                        <p className="text-white/40 text-sm font-medium">Your learning notes will appear here as you practice.</p>
                                    </motion.div>
                                ) : (
                                    mistakes.map(mistake => (
                                        <motion.div 
                                            key={mistake.id}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-indigo-500/30 transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                                                    <AlertCircle size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2">Correction Found</p>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-[10px] text-rose-400 font-bold uppercase mb-1">You said:</p>
                                                            <p className="text-sm text-white/70 line-through decoration-rose-500/50">"{mistake.wrong}"</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Kynara says:</p>
                                                            <p className="text-sm text-white font-medium italic">"{mistake.correction}"</p>
                                                        </div>
                                                        {mistake.explanation && (
                                                            <div className="pt-2 border-t border-white/5">
                                                                <p className="text-[10px] text-amber-400/60 font-bold uppercase mb-1">Why?</p>
                                                                <p className="text-xs text-white/40 italic">{mistake.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-4 flex gap-2">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsRepeating(true);
                                                                setTargetSentence(mistake.correction);
                                                            }}
                                                            className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20 transition-all"
                                                        >
                                                            Practice Saying This
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )
                            ) : (
                                sessionMessages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} mb-4`}
                                    >
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20 rounded-tr-none' 
                                            : 'bg-white/5 text-white/70 border border-white/5 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-indigo-600/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tighter">Daily Target (5 Spoken)</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (progress / 5) * 100)}%` }}
                                            className={`h-full bg-gradient-to-r ${progress >= 5 ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500'} rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]`} 
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-white/60">{progress}/5</span>
                                </div>
                            </div>
                        </div>
                        {progress >= 5 ? (
                            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-2">
                                <Zap size={12} /> Daily Goal Smashed! +20 XP Reward
                            </div>
                        ) : (
                            <p className="text-[11px] text-white/50 leading-relaxed">
                                Practice {5 - progress} more sentences to hit your daily goal and earn bonus XP.
                            </p>
                        )}
                    </div>
                </aside>
            </div>

            {/* Badges Modal */}
            <AnimatePresence>
                {showBadges && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBadges(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        Achievements <Trophy className="text-amber-500" />
                                    </h2>
                                    <p className="text-white/40 text-sm mt-1">Earn badges to showcase your progress</p>
                                </div>
                                <button onClick={() => setShowBadges(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ALL_BADGES.map(badge => {
                                        const isEarned = earnedBadges.includes(badge.id);
                                        return (
                                            <div 
                                                key={badge.id}
                                                className={`p-5 rounded-2xl border transition-all duration-500 ${
                                                    isEarned 
                                                    ? 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]' 
                                                    : 'bg-white/[0.02] border-white/5 opacity-50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                                                        isEarned ? 'bg-indigo-500/20' : 'bg-white/5 grayscale'
                                                    }`}>
                                                        {badge.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-bold ${isEarned ? 'text-white' : 'text-white/40'}`}>{badge.name}</h3>
                                                        <p className="text-xs text-white/30 mt-1">{badge.desc}</p>
                                                        
                                                        {isEarned ? (
                                                            <div className="flex items-center gap-2 mt-4">
                                                                <button 
                                                                    onClick={() => downloadBadge(badge)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-bold text-white transition-colors"
                                                                >
                                                                    <Download size={12} /> Download
                                                                </button>
                                                                <button 
                                                                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5] hover:bg-[#0077b5]/80 rounded-lg text-[10px] font-bold text-white transition-colors"
                                                                >
                                                                    <Linkedin size={12} /> Share
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-wider">
                                                                <Lock size={12} /> Locked
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                    <h4 className="text-amber-500 font-bold text-sm mb-2 flex items-center gap-2">
                                        <Star size={16} className="fill-amber-500" /> Future Rewards
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/60">Milestone Reach 2000 XP</span>
                                            <span className="text-amber-500/60 font-mono">LOCKED</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/60">30 Day Multi-Streak</span>
                                            <span className="text-amber-500/60 font-mono">LOCKED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    </div>
    );
}
