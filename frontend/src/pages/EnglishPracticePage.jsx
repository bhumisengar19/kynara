import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Mic, MicOff, Volume2, Trophy, AlertCircle, BookOpen, ArrowLeft, History, Zap, Award, Star, Download, Linkedin, Share2, X, ChevronRight, CheckCircle2, Lock, Settings, Briefcase, ShoppingBag, Plane, Coffee, Users, Target, BarChart3, Brain, Sparkles, RefreshCcw, Stethoscope, Utensils, Timer, Shield, Swords, FileText, Layout, GraduationCap, Gamepad2, BookMarked, MessageSquarePlus, Lightbulb, Languages, Repeat, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AvatarModel } from '../components/FloatingAvatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'react-router-dom';

// Badge Definitions (Global Registry)
const ALL_BADGES = [
    { id: 'enthusiast', name: 'Practice Enthusiast', icon: '🔥', requirement: (stats) => (stats.count || 0) >= 5 },
    { id: 'scholar', name: 'Language Scholar', icon: '📚', requirement: (stats) => (stats.xp || 0) >= 500 },
    { id: 'streaker', name: 'Consistent Streak', icon: '⚡', requirement: (stats) => (stats.streak || 0) >= 3 },
    { id: 'master', name: 'English Master', icon: '👑', requirement: (stats) => (stats.xp || 0) >= 1000 }
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
    const [trainingMode, setTrainingMode] = useState('conversation'); // conversation, shadowing, thinkfast, mocktest, story, debate, replay
    const [timer, setTimer] = useState(null);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [weakAreas, setWeakAreas] = useState([]);
    const [vocabulary, setVocabulary] = useState([]); // { word, translation, meaning, example }
    const [userGoal, setUserGoal] = useState('general'); // career, travel, academic, social
    const [learningPath, setLearningPath] = useState({
        currentLevel: 1,
        dailyTarget: 5,
        completedToday: 0,
        milestones: []
    });
    const [showSummary, setShowSummary] = useState(false); // Post-session summary
    const [sessionStats, setSessionStats] = useState(() => ({
        startTime: Date.now(),
        newWords: 0,
        mistakesFixed: 0,
        avgConfidence: 0
    }));
    const [nativeMode, setNativeMode] = useState(false);
    const [hintMode, setHintMode] = useState(false);
    const [activeView, setActiveView] = useState('practice'); // practice, hub, games, vocab
    const [isRepeating, setIsRepeating] = useState(false); // For Repeat & Improve mode
    const [targetSentence, setTargetSentence] = useState("");
    
    // ADVANCED HUMAN-LIKE INTERACTION STATES
    const [isSurvivalMode, setIsSurvivalMode] = useState(false);
    const [survivalLives, setSurvivalLives] = useState(3);
    const [speakingTimer, setSpeakingTimer] = useState(0); 
    const [isContinuousMode, setIsContinuousMode] = useState(false);
    const [thinkingState, setThinkingState] = useState(null); // 'analyzing', 'formulating', 'reacting'
    const [dailyPrompt, setDailyPrompt] = useState("");
    const [thinkBeforeSpeak, setThinkBeforeSpeak] = useState(false);
    const [countdown, setCountdown] = useState(0);
    
    // ADVANCED ADAPTIVE & IQ STATES
    const [learningDNA, setLearningDNA] = useState({ 
        personality: "Explorer", 
        strength: "Vocabulary", 
        style: "Casual", 
        focusArea: "Grammar" 
    });
    const [isMultiPerson, setIsMultiPerson] = useState(false);
    const [sayItDifferently, setSayItDifferently] = useState(false);

    const [preSpeakingTip, setPreSpeakingTip] = useState(null);
    const [difficultyLevel, setDifficultyLevel] = useState(1); // 1-5 Scale
    
    // NOTIFICATION & ENGAGEMENT STATES
    const [notifications, setNotifications] = useState([]); // [{id, type, message, duration}]
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [lastInteraction, setLastInteraction] = useState(() => Date.now());
    const [showLeaveWarning, setShowLeaveWarning] = useState(false);
    
    const recognitionRef = useRef(null);
    const utteranceRef = useRef(null);
    const scrollRef = useRef(null);
    const audioContextRef = useRef(null);
    const analystRef = useRef(null);

    // Particle/Aesthetic Data (Memoized to avoid render cycle impurities)
    const atmosphericParticles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        opacity: Math.random() * 0.5,
        targetX: Math.random() * 100 + "%",
        duration: 20 + Math.random() * 20
    })), []);

    const cognitiveGlows = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        height: Math.random() * 60 + 10,
        duration: 0.3 + Math.random() * 0.4
    })), []);

    // HOISTED HELPER FUNCTIONS
    function addNotification(type, message, duration = 3000) {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }

    function calculateLevel(currentXp) {
        let newLevel = "Beginner";
        if (currentXp >= 700) newLevel = "Fluent";
        else if (currentXp >= 300) newLevel = "Intermediate";
        setLevel(newLevel);
        return newLevel;
    }

    function analyzeLearningDNA(stats) {
        const totalMistakes = stats.totalMistakes || 0;
        let personality = "Explorer";
        if (totalMistakes > 20) personality = "The Analytical Mind";
        else if (stats.xp > 500) personality = "The Fluent Speaker";
        setLearningDNA(prev => ({ ...prev, personality }));
    }

    function checkBadges(stats) {
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
            addNotification("badge", `🏆 Achievement Unlocked: ${newlyEarned.join(', ')}!`, 5000);
        }
    }

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
    
    // DAILY STATS & GAMIFICATION LOGIC
    useEffect(() => {
        const today = new Date().toDateString();
        let stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v2') || '{}');
        
        if (!stored.date) {
            // First time initialization
            const initial = { 
                date: today, 
                count: 0, 
                xp: 0, 
                streak: 0, 
                lastActive: "", 
                sentencesToday: 0,
                dailyTarget: 10,
                totalMistakes: 0
            };
            localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(initial));
            stored = initial; // Use the newly initialized data
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
        setLearningPath(prev => ({
            ...prev,
            completedToday: stored.sentencesToday || 0,
            dailyTarget: stored.dailyTarget || 10
        }));
        
        // Re-check badge earnings
        checkBadges(stored);

        if (stored.count >= 15) setDailyLimitReached(true);
        calculateLevel(stored.xp || 0);

        // Daily Goal Popup on open
        if (stored.sentencesToday > 0 && stored.sentencesToday < 5) {
            setTimeout(() => {
                addNotification("goal", "🎯 You are close to completing today's goal!", 5000);
            }, 2000);
        }

        // Set Daily Prompt
        const prompts = [
            "What's one thing you'd change about the world?",
            "Talk about your favorite travel memory.",
            "Describe your ideal workplace environment.",
            "How do you think AI will change education?",
            "Discuss the pros and cons of remote work."
        ];
        setDailyPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
        
        // Analyze for Learning DNA
        analyzeLearningDNA(stored);
    }, []);

    // NOTIFICATION MANAGER (addNotification function is now hoisted)

    // INACTIVITY TRACKER
    useEffect(() => {
        const interval = setInterval(() => {
            const idleTime = Date.now() - lastInteraction;
            if (idleTime > 60000 && !isListening && !isSpeaking && !configMode && activeView === 'practice') { // 60 seconds
                addNotification("inactivity", "😴 Let's practice one sentence!", 4000);
                setLastInteraction(Date.now()); // Reset to avoid spamming
            }
        }, 10000);

        const resetInteraction = () => setLastInteraction(Date.now());
        window.addEventListener('mousemove', resetInteraction);
        window.addEventListener('keydown', resetInteraction);

        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', resetInteraction);
            window.removeEventListener('keydown', resetInteraction);
        };
    }, [lastInteraction, isListening, isSpeaking, configMode, activeView]);

    // MOTIVATIONAL SYSTEM
    useEffect(() => {
        if (!configMode && activeView === 'practice') {
            const interval = setInterval(() => {
                const quotes = [
                    "🚀 You're improving fast!",
                    "🔥 Keep going! You're on fire!",
                    "🧠 Your vocabulary is expanding!",
                    "🌟 Consistency is key!",
                    "💪 Practice makes perfect!"
                ];
                addNotification("motivation", quotes[Math.floor(Math.random() * quotes.length)], 3000);
            }, 120000); // Every 2 minutes
            return () => clearInterval(interval);
        }
    }, [configMode, activeView]);

    // ROLEPLAY MODE CHANGE NOTIFICATION
    useEffect(() => {
        if (!configMode && activeView === 'practice') {
            const modeName = SCENARIOS.find(s => s.id === scenario)?.name || scenario;
            addNotification("motivation", `✨ Performance Mode: ${modeName}`, 4000);
        }
    }, [scenario, configMode]);

    const handleExit = () => {
        if (!configMode && activeView === 'practice' && sessionMessages.length > 2) {
            setShowLeaveWarning(true);
        } else {
            navigate('/chat');
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

        const today = new Date().toDateString();
        stored.xp = newXp;
        stored.lastActive = today; 
        localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(stored));
        
        setXp(newXp);
        const newLv = calculateLevel(newXp);
        if (newLv !== level) {
            setShowLevelUp(true);
            addNotification("levelup", `🆙 Level Up! You reached ${newLv}!`, 5000);
        }
        
        checkBadges(stored);
        
        // XP GAIN MICRO POPUP logic
        addNotification("xp", `+${amount} XP`, 1500);
        
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
        }

        if (newProg === 5) {
            awardXP(20, "Daily Goal Met! 🎉");
        }
    };

    function incrementUsage() {
        const stored = JSON.parse(localStorage.getItem('kynara_coach_stats_v2') || '{}');
        stored.count = (stored.count || 0) + 1;
        localStorage.setItem('kynara_coach_stats_v2', JSON.stringify(stored));
        setUsageCount(stored.count);
        if (stored.count >= 15) setDailyLimitReached(true);
    }

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
            
            // Adjust personality based on level (Human-like evolution)
            let refinedPersonality = personality;
            if (level === 'Fluent' || level === 'Advanced') {
                refinedPersonality = 'mentor'; // Automatically become more professional
            }

            const res = await api.post("/chat/new", { 
                greeting: initialGreeting,
                scenario: scenario,
                personality: refinedPersonality
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
        let interval;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && isTimerActive) {
            setIsTimerActive(false);
            submitToCoach("(Timed out: user didn't respond in time)");
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('kynara_coach_pro_v1') || '{}');
        setXp(stored.xp || 0);
        calculateLevel(stored.xp || 0);
        setEarnedBadges(stored.badges || []);
        setWeakAreas(stored.weakAreas || []);
        setVocabulary(stored.vocabulary || []);
        setUserGoal(stored.userGoal || 'general');
        setLearningPath(prev => ({ ...prev, ...stored.learningPath }));
        setAnalytics(prev => ({
            ...prev,
            ...stored.lastAnalytics
        }));
        return () => window.speechSynthesis.cancel();
    }, []);

    useEffect(() => {
        const state = { xp, badges: earnedBadges, weakAreas, vocabulary, userGoal, learningPath, lastAnalytics: analytics };
        localStorage.setItem('kynara_coach_pro_v1', JSON.stringify(state));
    }, [xp, earnedBadges, weakAreas, vocabulary, userGoal, learningPath, analytics]);

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

        if (thinkBeforeSpeak) {
            setCountdown(3);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        startSpeechRecognition();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            startSpeechRecognition();
        }
    };

    const startSpeechRecognition = () => {
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

    // AI SUBMISSION ENGINE
    async function submitToCoach(text) {
        if (!currentChatId || dailyLimitReached) return;
        
        // IQ Level Adjustment (Real-time)
        if (combo > 5) setDifficultyLevel(Math.min(5, difficultyLevel + 1));
        if (analytics.grammarScore < 40) setDifficultyLevel(Math.max(1, difficultyLevel - 1));

        // MISTAKE PREDICTOR logic
        const commonError = mistakes.find(m => m.category === 'Grammar')?.correction;
        if (commonError) {
            setPreSpeakingTip(`💡 Predictive Analysis: You might struggle with ${commonError.substring(0, 10)}... patterns today. Stay focused!`);
        }

        // INTERRUPT SYSTEM (Occasional simulation)
        if (isSpeaking && Math.random() < 0.2) {
            addNotification("motivation", "AI Coach: Let me stop you there—interesting point!", 3000);
        }

        setStatus('thinking');
        setThinkingState('analyzing');
        
        // Artificial thinking delay (Human-like process)
        await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
        setThinkingState('formulating');
        await new Promise(r => setTimeout(r, 600));

        incrementUsage();
        setIsTimerActive(false);
        
        try {
            // Behavioral Heuristics
            const fillers = text.match(/\b(um|uh|err|like|you know|so|well)\b/gi) || [];
            const words = text.split(/\s+/).length;
            const confidence = Math.min(100, Math.round((words / 15) * 100)); // Rough confidence score based on length

            setAnalytics(prev => ({
                ...prev,
                fillersCount: prev.fillersCount + fillers.length,
                confidence: confidence
            }));

            // Handle Review & Improve comparison (same as shadowing basically)
            if (isRepeating || trainingMode === 'shadowing') {
                const target = targetSentence.toLowerCase().replace(/[.,!?;:]/g, "");
                const input = text.toLowerCase().replace(/[.,!?;:]/g, "");
                const similarity = input === target ? 100 : 0; 
                
                if (similarity === 100) {
                    awardXP(20, "Vocal Master! 🔥");
                    setSessionMessages(prev => [...prev, 
                        { role: 'user', content: `(Repeat) ${text}` },
                        { role: 'assistant', content: "Perfect mimicry! Your pronunciation and rhythm are spot on." }
                    ]);
                    speakResponse("Perfect mimicry! Your pronunciation and rhythm are spot on.");
                } else {
                    setSessionMessages(prev => [...prev, 
                        { role: 'user', content: `(Repeat) ${text}` },
                        { role: 'assistant', content: `Close, but watch the phrasing. You said: "${text}". Target was: "${targetSentence}"` }
                    ]);
                    speakResponse("Close, but try to match the phrasing exactly.");
                }
                setIsRepeating(false);
                setTargetSentence("");
                setStatus('online');
                return;
            }
             // Adaptive Intelligence Injection
        const sayItDifferentlyPrompt = sayItDifferently ? " | ACT AS NATIVE COACH: After your response, provide exactly one more natural/native way to say what I just said." : "";
        const multiPersonPrompt = isMultiPerson ? " | GROUP DISCUSSION: Simulate a collaborative or adversarial response from 2 different AI personalities." : "";
        
            const res = await api.post("/chat/send", {
                message: text + sayItDifferentlyPrompt + multiPersonPrompt,
                chatId: currentChatId,
                englishMode: true,
                scenario,
                personality,
                difficulty,
                trainingMode,
                userGoal,
                nativeMode,
                hintRequested: hintMode
            });

            const { reply } = res.data;
            
            // Advanced Parsing
            const corrMatch = reply.match(/CORRECTION:\s*(.*?)(?=\n|CATEGORY:|$)/i);
            const explMatch = reply.match(/EXPLANATION:\s*(.*?)(?=\n|CATEGORY:|$)/i);
            const catMatch = reply.match(/CATEGORY:\s*(.*?)(?=\n|SCORES:|$)/i);
            const scoresMatch = reply.match(/SCORES:\s*\[Grammar:\s*(\d+)\/100,\s*Vocabulary:\s*(\d+)\/100,\s*Fluency:\s*(\d+)\/100\]/i);
            const restMatch = reply.match(/RESTRUCTURE:\s*(.*?)(?=\n|VOCAB:|$)/i);
            const vocabMatch = reply.match(/VOCAB:\s*(.*?)(?=\n|$)/i);

            // VOCAB AUTO-CAPTURE
            if (vocabMatch) {
                const parts = vocabMatch[1].split('|').map(p => p.trim());
                if (parts.length >= 2) {
                    const newWord = { 
                        word: parts[0], 
                        meaning: parts[1], 
                        example: parts[2] || "Used in conversation." 
                    };
                    setVocabulary(prev => {
                        if (prev.find(v => v.word.toLowerCase() === newWord.word.toLowerCase())) return prev;
                        return [newWord, ...prev];
                    });
                }
            }

            // PROGRESS TRACKING
            setLearningPath(prev => ({
                ...prev,
                completedToday: prev.completedToday + 1
            }));

            const correctionText = (corrMatch ? corrMatch[1].trim() : "").replace(/^\"|\"$/g, "");
            const isPerfect = correctionText.toLowerCase().includes('perfect');

            if (scoresMatch) {
                setAnalytics(prev => {
                    const next = {
                        ...prev,
                        grammarScore: parseInt(scoresMatch[1]),
                        vocabScore: parseInt(scoresMatch[2]),
                        fluencyScore: parseInt(scoresMatch[3])
                    };
                    return next;
                });
            }

            // MISTAKE ALERT logic
            if (!isPerfect && correctionText) {
                setRepeatedMistakes(prev => {
                    const count = (prev[correctionText] || 0) + 1;
                    if (count >= 2) {
                        addNotification("mistake", "⚠️ You made this mistake before! Focus on this structure.", 5000);
                    }
                    return { ...prev, [correctionText]: count };
                });
            }

            // Final Score & Analytics Updates & Gamification
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

            // Survival Mode Logic
            if (isSurvivalMode && !isPerfect) {
                setSurvivalLives(prev => {
                    const next = prev - 1;
                    if (next <= 0) {
                        addNotification("mistake", "💀 Game Over! You used up your lives. Review your mistakes.", 6000);
                        setIsSurvivalMode(false);
                    } else {
                        addNotification("mistake", `💔 ${next} lives remaining!`, 4000);
                    }
                    return next;
                });
            }

            let cleanReply = reply.replace(/CORRECTION:[\s\S]*?SCORES:.*?(\n\n|\n|$)/i, "").trim();

            // Interruption system: Simulate natural flow
            if (Math.random() < 0.15) {
                cleanReply = "Wait, let me interject. " + cleanReply;
            }

            setSessionMessages(prev => [...prev, 
                { role: 'user', content: text },
                { role: 'assistant', content: cleanReply }
            ]);
            
            speakResponse(cleanReply);
            setThinkingState(null);
            
            // Think Fast Timer logic
            if (trainingMode === 'thinkfast') {
                setTimer(5);
                setIsTimerActive(true);
            }

            setStatus('online');
            setTranscript("");
        } catch (err) {
            console.error("Session Submit Error:", err);
            setStatus('online');
        }
    };

    // Real-time Interruption Effect (Real-life simulation)
    useEffect(() => {
        let interval;
        if (isListening && status === 'online') {
            interval = setInterval(() => {
                // Low chance of interruption to maintain realism without being annoying
                if (Math.random() < 0.04) { 
                    addNotification("info", "AI Coach: Wait, sorry to interrupt—actually, I have a quick thought!", 4000);
                    if (recognitionRef.current) {
                        try {
                            recognitionRef.current.stop();
                        } catch (e) {}
                    }
                    submitToCoach(transcript + " [USER INTERRUPTED]"); 
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isListening, transcript, status]);

    const finishSession = () => {
        const stats = {
            ...sessionStats,
            endTime: Date.now(),
            duration: Math.round((Date.now() - sessionStats.startTime) / 60000),
            totalSentences: sessionMessages.length / 2,
            mistakesCount: mistakes.length
        };
        setSessionStats(stats);
        setShowSummary(true);
    };

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#050508]' : 'bg-slate-50'}`}>
            
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-white/5 backdrop-blur-xl bg-black/20 z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleExit}
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
            <div className="flex-1 flex relative overflow-hidden">
                
                {/* View Switcher Sidebar (Vertical) */}
                <div className="w-[70px] border-r border-white/5 bg-[#0a0a0f] flex flex-col items-center py-8 gap-8 z-[60]">
                    {[
                        { id: 'practice', icon: <Swords size={20}/>, label: 'Train' },
                        { id: 'hub', icon: <Target size={20}/>, label: 'Goal' },
                        { id: 'vocab', icon: <BookMarked size={20}/>, label: 'Words' },
                        { id: 'games', icon: <Gamepad2 size={20}/>, label: 'Play' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveView(tab.id)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative group ${
                                activeView === tab.id 
                                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                                : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                            }`}
                        >
                            {tab.icon}
                            <span className="absolute left-[80px] px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Configuration Overlay */}
                <AnimatePresence>
                    {configMode && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-[#050508]/80 backdrop-blur-3xl flex items-center justify-center p-8"
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
                                        <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                                            {[
                                                { id: 'conversation', name: 'Real Conversations', icon: <Users size={16}/> },
                                                { id: 'shadowing', name: 'Shadowing Flow', icon: <Volume2 size={16}/> },
                                                { id: 'thinkfast', name: 'Think Fast! ⚡', icon: <Timer size={16}/> },
                                                { id: 'mocktest', name: 'Mock Test / Battle', icon: <Trophy size={16}/> },
                                                { id: 'story', name: 'Interactive Story', icon: <BookOpen size={16}/> },
                                                { id: 'debate', name: 'Hot Debate 🔥', icon: <Swords size={16}/> },
                                                { id: 'replay', name: 'Mistake Replay', icon: <RefreshCcw size={16}/> }
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
                                        <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Your Learning Goal</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'general', name: 'General Fluency' },
                                                { id: 'career', name: 'Career Growth' },
                                                { id: 'travel', name: 'Global Travel' },
                                                { id: 'academic', name: 'Educational' }
                                            ].map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => setUserGoal(g.id)}
                                                    className={`py-2 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                                        userGoal === g.id
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                                        : 'bg-white/5 border-white/5 text-white/20'
                                                    }`}
                                                >
                                                    {g.name}
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

                {/* Main Viewport */}
                <main className="flex-1 relative flex flex-col overflow-hidden bg-black/20">
                    <AnimatePresence mode="wait">
                        {activeView === 'practice' ? (
                            <motion.div 
                                key="practice"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex-1 flex flex-col relative"
                            >
                                {/* Center Panel - The Avatar */}
                                <div className="flex-1 relative flex flex-col">
                                    <div className="flex-1 w-full relative">
                                        {/* Multi-Person Presence */}
                                        {isMultiPerson && (
                                            <div className="absolute top-10 right-10 flex flex-col gap-4 z-40">
                                                <div className="w-12 h-12 bg-purple-600/30 rounded-2xl border border-purple-500/20 backdrop-blur-xl flex items-center justify-center text-purple-200">
                                                    <Users size={20} />
                                                </div>
                                                <div className="w-12 h-12 bg-amber-600/30 rounded-2xl border border-amber-500/20 backdrop-blur-xl flex items-center justify-center text-amber-200">
                                                    <Briefcase size={20} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Predictive Mistake Tip */}
                                        <AnimatePresence>
                                            {preSpeakingTip && isListening && (
                                                <motion.div 
                                                    initial={{ y: 50, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -50, opacity: 0 }}
                                                    className="absolute bottom-40 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
                                                >
                                                    <div className="bg-indigo-600/10 backdrop-blur-2xl border border-indigo-500/20 p-4 rounded-[24px] text-center shadow-2xl">
                                                        <p className="text-white/80 text-[11px] font-black italic tracking-wide">
                                                            {preSpeakingTip}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {/* AI Thinking Atmosphere */}
                                        <AnimatePresence>
                                            {status === 'thinking' && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }} 
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[2px] z-20 flex items-center justify-center"
                                                >
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="flex gap-2">
                                                            {[0, 1, 2].map(i => (
                                                                <motion.div 
                                                                    key={i}
                                                                    animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                                                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                                    className="w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                                                                />
                                                            ))}
                                                        </div>
                                                        <motion.p 
                                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                            className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em]"
                                                        >
                                                            {thinkingState === 'analyzing' ? 'Analyzing your structure' : 
                                                             thinkingState === 'formulating' ? 'Formulating response' : 
                                                             'AI Processing'}
                                                        </motion.p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Think Before Speak Countdown */}
                                        <AnimatePresence>
                                            {countdown > 0 && (
                                                <motion.div 
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 2, opacity: 0 }}
                                                    className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                                                >
                                                    <span className="text-9xl font-black text-white/20 italic tracking-tighter">
                                                        {countdown}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Daily Prompt Overlay (if no messages) */}
                                        {sessionMessages.length === 0 && !configMode && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-sm"
                                            >
                                                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] text-center shadow-2xl">
                                                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl mx-auto flex items-center justify-center mb-4 text-indigo-400">
                                                        <Sparkles size={24} />
                                                    </div>
                                                    <h4 className="text-white font-black italic tracking-tighter text-2xl mb-2">DAILY CHALLENGE</h4>
                                                    <p className="text-white/60 text-sm leading-relaxed mb-6">"{dailyPrompt}"</p>
                                                    <button 
                                                        onClick={handleVoiceInput}
                                                        className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all active:scale-95"
                                                    >
                                                        Start Response
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Survival Hearts */}
                                        {isSurvivalMode && (
                                            <div className="absolute top-6 left-6 z-40 flex gap-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={i < survivalLives ? { scale: 1 } : { scale: 0.8, opacity: 0.3, filter: 'grayscale(1)' }}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-500`}
                                                    >
                                                        <Zap size={16} className={i < survivalLives ? "fill-rose-500" : ""} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                        {/* 3D Background elements */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent)]" />
                                        
                                        {/* Interactive Particles Background */}
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                                            {atmosphericParticles.map((p) => (
                                                <motion.div 
                                                    key={p.id}
                                                    initial={{ 
                                                        x: p.x, 
                                                        y: p.y,
                                                        opacity: p.opacity 
                                                    }}
                                                    animate={{ 
                                                        y: [null, "100%", "0%"],
                                                        x: [null, p.targetX],
                                                        scale: [1, 1.2, 1]
                                                    }}
                                                    transition={{ 
                                                        duration: p.duration, 
                                                        repeat: Infinity, 
                                                        ease: "linear" 
                                                    }}
                                                    className="absolute w-1 h-1 bg-indigo-500/20 rounded-full blur-[1px]"
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

                                        {/* Speaking Waveform */}
                                        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-64 h-24 flex items-center justify-center gap-1">
                                            {isSpeaking && (
                                                <div className="flex items-end justify-center gap-1.5 h-16">
                                                    {cognitiveGlows.map((glow) => (
                                                        <motion.div 
                                                            key={glow.id}
                                                            animate={{ 
                                                                height: [10, glow.height, 10],
                                                                opacity: [0.3, 1, 0.3]
                                                            }}
                                                            transition={{ 
                                                                duration: glow.duration, 
                                                                repeat: Infinity 
                                                            }}
                                                            className="w-1 bg-indigo-400/60 rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            )}
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

                                        {/* Smart Feedback Tooltip (Inside Workspace) */}
                                        <AnimatePresence>
                                            {lastCorrection && (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className="absolute top-1/4 right-10 z-50 pointer-events-none"
                                                >
                                                    <div className="bg-indigo-600/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl max-w-[240px]">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Brain size={14} className="text-indigo-200" />
                                                            <span className="text-[9px] font-black text-indigo-100 uppercase tracking-widest">AI Coach Insight</span>
                                                        </div>
                                                        <p className="text-white text-[11px] font-medium leading-relaxed italic">
                                                            {lastCorrection.correction}
                                                        </p>
                                                        {lastCorrection.explanation && (
                                                            <div className="mt-2 pt-2 border-t border-white/10 text-white/60 text-[9px]">
                                                                Tip: {lastCorrection.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Tooltip Arrow alternative */}
                                                    <div className="absolute top-1/2 -right-1 w-2 h-2 bg-indigo-600 rotate-45 transform -translate-y-1/2" />
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
                                    <div className="p-12 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-6 bg-gradient-to-t from-[#050508] to-transparent z-10">
                                        <div className="flex items-center gap-4 w-full">
                                            <button 
                                                onClick={() => setNativeMode(!nativeMode)}
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                                                    nativeMode 
                                                    ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                                    : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'
                                                }`}
                                                title="Translate Mode: Speak in your native language"
                                            >
                                                <Languages size={22}/>
                                            </button>

                                            <button 
                                                onClick={() => setSayItDifferently(!sayItDifferently)}
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                                                    sayItDifferently 
                                                    ? 'bg-purple-500/20 border-purple-500 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                                    : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'
                                                }`}
                                                title="Say It Differently Mode: Rephrase your sentence like a native"
                                            >
                                                <Repeat size={22}/>
                                            </button>

                                            <button 
                                                onClick={() => handleVoiceInput()}
                                                disabled={status === 'thinking'}
                                                className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-4 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl group ${
                                                    isListening 
                                                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/20' 
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-indigo-500/20'
                                                }`}
                                            >
                                                {isListening ? <MicOff size={22}/> : <Mic size={22} className="group-hover:scale-110 transition-transform" />}
                                                {isListening ? (nativeMode ? 'Translating...' : 'Stop Listening') : (nativeMode ? 'Speak Native' : 'Start Speaking')}
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setHintMode(true);
                                                    setTimeout(() => setHintMode(false), 3000); // Temporary hint state
                                                    submitToCoach("I need a hint for this situation.");
                                                }}
                                                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-indigo-400 hover:bg-white/10 transition-all active:scale-95 group"
                                                title="Get Smart Hint"
                                            >
                                                <Lightbulb size={22} className={hintMode ? 'animate-bounce text-amber-400' : ''} />
                                            </button>

                                            <button 
                                                onClick={finishSession}
                                                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all active:scale-95 group"
                                                title="Finish Session & View Report"
                                            >
                                                <FileText size={22} className="group-hover:text-indigo-400 transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeView === 'hub' ? (
                            <motion.div key="hub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                                <div className="max-w-4xl mx-auto space-y-12">
                                    <header>
                                        <h2 className="text-4xl font-black text-white italic tracking-tighter">Mission Control</h2>
                                        <p className="text-white/40">AI-driven roadmap for {learningDNA.personality} personality.</p>
                                    </header>
                                    {/* Learning DNA Profile */}
                                    <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[40px] flex items-center gap-8">
                                        <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-4xl border-2 border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                                            🧬
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Learning DNA Profile</p>
                                            <h3 className="text-2xl font-black text-white mb-2">{learningDNA.personality}</h3>
                                            <div className="flex gap-4">
                                                <span className="text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-lg">Strength: {learningDNA.strength}</span>
                                                <span className="text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-lg">Style: {learningDNA.style}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => addNotification("info", "Generating personalized quiz based on your persistent errors...", 3000)}
                                        className="w-full py-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 rounded-[32px] border border-indigo-500/20 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl group"
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <Sparkles size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                                            <span>Generate AI IQ Quiz from Mistakes</span>
                                        </div>
                                    </button>

                                    {/* Mistake Heatmap / Weak Areas */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-[0.3em] flex items-center gap-2">
                                            <AlertCircle size={14}/> Weak Area Heatmap
                                        </h4>
                                        <div className="grid grid-cols-4 gap-4">
                                            {['Grammar', 'Vocab', 'Fluency', 'Struct'].map((area, idx) => {
                                                const count = mistakes.filter(m => m.category === area).length;
                                                const intensity = Math.min(100, count * 20);
                                                return (
                                                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                                        <div className="w-full h-1.5 bg-white/5 rounded-full mb-3 overflow-hidden">
                                                            <div className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${intensity}%` }} />
                                                        </div>
                                                        <h5 className="text-[8px] font-black text-white/40 uppercase tracking-widest">{area}</h5>
                                                        <p className="text-xs font-black text-white mt-1">{count}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* Intelligence Roadmap */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] flex items-center gap-2">
                                            <Map size={14}/> Intelligence Trajectory
                                        </h4>
                                        <div className="grid grid-cols-3 gap-6">
                                            {[
                                                { step: 1, title: 'Basics', status: 'completed' },
                                                { step: 2, title: 'Fluency', status: 'in-progress' },
                                                { step: 3, title: 'Mastery', status: 'locked' }
                                            ].map((s, idx) => (
                                                <div key={idx} className={`p-6 rounded-3xl border transition-all ${s.status === 'completed' ? 'bg-indigo-600/20 border-indigo-500/40' : s.status === 'in-progress' ? 'bg-white/5 border-white/20 animate-pulse' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                                                        {s.status === 'completed' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <p className="text-[10px] font-black text-white/40">{s.step}</p>}
                                                    </div>
                                                    <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{s.title}</h5>
                                                    <p className="text-[9px] text-white/30 italic mt-1">{s.status}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                <Star size={14}/> Micro-Lessons (1 Min)
                                            </h5>
                                            <div className="space-y-3">
                                                {[
                                                    { title: "Mastering Connector Words", tag: "Grammar", level: "A2" },
                                                    { title: "Professional Phrasal Verbs", tag: "Vocab", level: "B2" },
                                                    { title: "Nuance in Casual Talk", tag: "Fluency", level: "B1" }
                                                ].map((lesson, idx) => (
                                                    <button key={idx} className="w-full p-6 bg-white/[0.03] hover:bg-white/5 border border-white/5 rounded-3xl text-left flex items-center justify-between group transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                                                                <Layout size={20}/>
                                                            </div>
                                                            <div>
                                                                <h6 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{lesson.title}</h6>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-[8px] text-indigo-400/60 font-bold uppercase">{lesson.tag}</span>
                                                                    <span className="text-[8px] text-white/20 font-bold uppercase">•</span>
                                                                    <span className="text-[8px] text-white/20 font-bold uppercase">{lesson.level} Level</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                <Zap size={14}/> Intelligence Focus
                                            </h5>
                                            <div className="grid grid-cols-1 gap-4">
                                                <button onClick={() => { setActiveView('practice'); setTrainingMode('replay'); }} className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[32px] text-left flex items-center gap-6 hover:bg-rose-500/20 transition-all group">
                                                    <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform"><RefreshCcw /></div>
                                                    <div>
                                                        <h5 className="text-xs font-black text-white uppercase tracking-widest mb-1">Error Replay System</h5>
                                                        <p className="text-[10px] text-rose-300/60 leading-relaxed">Face your {mistakes.length} past persistent mistakes in a specialized shadowing drill.</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => { setActiveView('practice'); setTrainingMode('debate'); }} className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[32px] text-left flex items-center gap-6 hover:bg-amber-500/20 transition-all group">
                                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Swords /></div>
                                                    <div>
                                                        <h5 className="text-xs font-black text-white uppercase tracking-widest mb-1">Advanced Debate Mode</h5>
                                                        <p className="text-[10px] text-amber-300/60 leading-relaxed">Challenge the AI on complex topics to improve your technical vocabulary.</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeView === 'vocab' ? (
                            <motion.div 
                                key="vocab"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 p-12 overflow-y-auto custom-scrollbar"
                            >
                                <div className="max-w-4xl mx-auto space-y-12">
                                    <h2 className="text-4xl font-black text-white mb-8 italic tracking-tighter">Vocab Bank</h2>
                                    {vocabulary.length === 0 ? (
                                        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] text-white/20 space-y-4">
                                            <BookMarked size={48}/>
                                            <p className="text-sm font-bold">Your bank is empty. Kynara will suggest words as you practice.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {vocabulary.map((v, i) => (
                                                <motion.div 
                                                    key={i} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-xl font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{v.word}</h4>
                                                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-indigo-500/20">New word</span>
                                                        </div>
                                                        <p className="text-sm text-white/40 italic font-medium leading-relaxed">"{v.meaning}"</p>
                                                        <div className="flex items-center gap-2 pt-2">
                                                            <span className="text-[9px] font-black text-indigo-300/40 uppercase tracking-widest">Example:</span>
                                                            <p className="text-[11px] text-white/60">{v.example}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => speakResponse(v.word)}
                                                        className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-indigo-600 transition-all shadow-lg"
                                                    >
                                                        <Volume2 size={24} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : activeView === 'games' ? (
                            <motion.div 
                                key="games"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex-1 flex items-center justify-center p-12"
                            >
                                <div className="text-center space-y-8 max-w-lg">
                                    <div className="w-32 h-32 mx-auto rounded-[40px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                                        <Gamepad2 size={64} className="text-amber-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mind Games Hub</h2>
                                        <p className="text-white/40 text-sm leading-relaxed">Interactive sentence rearranging and fill-in-the-blanks are rolling out in the next intelligence update. Keep training to stay ahead.</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveView('practice')}
                                        className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl border border-white/5 transition-all"
                                    >
                                        Back to Training
                                    </button>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </main>

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
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-[10px] text-white/30 font-bold uppercase mb-2">Fluency</p>
                                            <p className="text-2xl font-black text-indigo-400">{analytics.fluency}%</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-[10px] text-white/30 font-bold uppercase mb-2">Confidence</p>
                                            <p className="text-2xl font-black text-emerald-400">{analytics.confidence}%</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                                                <RefreshCcw size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase">Filler Words</p>
                                                <p className="text-sm font-black text-white">{analytics.fillersCount} Detected</p>
                                            </div>
                                        </div>
                                        {analytics.fillersCount > 5 && (
                                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-1 rounded-md font-bold uppercase">Needs Focus</span>
                                        )}
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

            {/* Session Summary Modal */}
            <AnimatePresence>
                {showSummary && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-[#050508]/95 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/10 p-12 rounded-[40px] max-w-2xl w-full relative overflow-hidden"
                        >
                            <div className="relative z-10 text-center space-y-8">
                                <div className="w-20 h-20 bg-indigo-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                                    <Award size={40} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">Session Complete!</h2>
                                    <p className="text-white/40 text-sm">You've just completed a focused {trainingMode} session.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Time', val: `${sessionStats.duration || 0}m`, icon: <Timer size={14}/> },
                                        { label: 'Words', val: sessionStats.newWords || 0, icon: <BookMarked size={14}/> },
                                        { label: 'Accuracy', val: `${analytics.accuracy}%`, icon: <BarChart3 size={14}/> }
                                    ].map((s, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-center gap-2 text-white/30 text-[9px] font-black uppercase mb-1">
                                                {s.icon} {s.label}
                                            </div>
                                            <div className="text-white font-black text-lg">{s.val}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 text-left">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Coaching Insights</p>
                                    <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl">
                                        <p className="text-white/80 text-sm leading-relaxed mb-4">
                                            Excellent control of tenses during the roleplay! You're consistently using the past perfect correctly. 
                                            To reach the next level, try to reduce your use of filler words like "like" and "um" which occurred {analytics.fillersCount} times today.
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[8px] font-bold rounded uppercase">Keep it Focus: Transition Words</span>
                                            <span className="px-2 py-1 bg-white/5 text-white/40 text-[8px] font-bold rounded uppercase">Suggested: Business Vocabulary</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setShowSummary(false);
                                        navigate('/chat');
                                    }}
                                    className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-400 transition-all"
                                >
                                    Close Performance Report
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Global Notification system */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none w-full max-w-sm">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            className={`px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 pointer-events-auto ${
                                n.type === 'xp' ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-200' :
                                n.type === 'levelup' ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' :
                                n.type === 'mistake' ? 'bg-rose-500/20 border-rose-500/30 text-rose-200' :
                                n.type === 'goal' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' :
                                'bg-white/10 border-white/10 text-white'
                            }`}
                        >
                            <div className="flex-shrink-0">
                                {n.type === 'xp' && <Zap size={16} className="text-indigo-400" />}
                                {n.type === 'levelup' && <Trophy size={16} className="text-amber-400" />}
                                {n.type === 'mistake' && <AlertCircle size={16} className="text-rose-400" />}
                                {n.type === 'goal' && <Target size={16} className="text-emerald-400" />}
                                {n.type === 'motivation' && <Sparkles size={16} className="text-indigo-400" />}
                                {n.type === 'inactivity' && <Timer size={16} className="text-amber-400" />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">{n.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Level Up Celebration Modal */}
            <AnimatePresence>
                {showLevelUp && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLevelUp(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0, y: 100 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full max-w-lg bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 rounded-[48px] p-12 text-center overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.3)]"
                        >
                            {/* Decorative Glows */}
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
                            
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)] mb-8"
                            >
                                <Trophy size={48} className="text-white" />
                            </motion.div>
                            
                            <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4">LEVELED UP!</h2>
                            <p className="text-amber-400 text-xl font-black uppercase tracking-widest mb-8">{level}</p>
                            
                            <p className="text-white/60 text-sm leading-relaxed mb-10">
                                You're pushing your limits! Your dedication is visible in every session. New achievements and scenarios are waiting.
                            </p>
                            
                            <button 
                                onClick={() => setShowLevelUp(false)}
                                className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Continue Your Journey
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Streak Warning Modal (on exit attempt) */}
            <AnimatePresence>
                {showLeaveWarning && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-[40px] p-10 text-center"
                        >
                            <div className="w-20 h-20 bg-orange-500/20 rounded-full mx-auto flex items-center justify-center mb-6">
                                <Zap size={40} className="text-orange-500 fill-orange-500" />
                            </div>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4">Don’t break your streak!</h3>
                            <p className="text-white/40 text-sm mb-8">You're on a {streak}-day streak. If you leave now, you might lose your progress for today.</p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setShowLeaveWarning(false)}
                                    className="h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all"
                                >
                                    Continue Practice
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowLeaveWarning(false);
                                        navigate('/chat');
                                    }}
                                    className="h-14 bg-white/5 text-white/40 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Remind Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
