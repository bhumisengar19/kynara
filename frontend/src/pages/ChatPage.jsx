import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, Sparkles, Brain, Zap, MessageSquare, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { SplineSceneBasic } from "../components/SplineSceneDemo";
import NeuralOrb from "../components/NeuralOrb";

const PERSONAS = [
    { id: "balanced", label: "Balanced", icon: Sparkles, color: "from-blue-500 to-indigo-500" },
    { id: "creative", label: "Creative", icon: Zap, color: "from-purple-500 to-pink-500" },
    { id: "technical", label: "Technical", icon: Brain, color: "from-emerald-500 to-teal-500" },
];

const SMART_ACTIONS = [
    { id: "summarize", label: "Summarize", icon: "📝" },
    { id: "explain", label: "Explain", icon: "🎓" },
    { id: "humanize", label: "Humanize", icon: "😊" },
    { id: "grammar", label: "Grammar", icon: "✨" },
    { id: "translate", label: "Translate", icon: "🌍" },
    { id: "regenerate", label: "Regenerate", icon: "🔁" },
];

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
};

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setChats, chats } = useChatContext();
    const { logout, user } = useAuth();

    const createChat = async () => {
        try {
            const res = await api.post("/chat/create", { title: "New Conversation" });
            setChats((prev) => [res.data, ...prev]);
            navigate(`/c/${res.data._id}`);
        } catch (err) {
            console.error("Failed to create chat", err);
        }
    };

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [persona, setPersona] = useState(PERSONAS[0]);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Load Chat
    useEffect(() => {
        if (!id) return;
        const loadChat = async () => {
            try {
                const res = await api.get(`/chat/history/${id}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load chat", err);
            }
        };
        loadChat();
    }, [id]);

    const sendMessage = async (action = null) => {
        if (!input.trim() && !action) return;

        const userMessage = { role: "user", content: input };

        // If it's a normal message, add it to UI
        if (!action) {
            setMessages((prev) => [...prev, userMessage]);
            setInput("");
        }

        setLoading(true);

        try {
            const res = await api.post("/chat", {
                message: action ? (input || "Previous Message") : userMessage.content,
                chatId: id,
                persona: persona.id,
                action: action
            });

            const { reply, newTitle } = res.data;
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

            if (newTitle) {
                setChats(prev => prev.map(c => c._id === id ? { ...c, title: newTitle } : c));
            }

            if (action) setInput(""); // Clear input if action was used
        } catch (err) {
            console.error("Chat Failed", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: `⚠️ **Error**: ${errorMsg}\n\n_If this persists, check your backend logs or API key._`
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!id) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden min-h-screen transition-all duration-700"
            >
                {/* Visual Background Blobs */}
                <div className="bg-blob -top-20 -left-20 bg-cyan-500/20" />
                <div className="bg-blob -bottom-20 -right-20 bg-purple-500/20" />

                {/* Header Actions */}
                <div className="w-full max-w-7xl mx-auto flex justify-end items-center p-8 relative z-50 gap-4">
                    <ThemeToggle />
                    <button
                        onClick={logout}
                        className="p-3 glass-panel hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Hero Section */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full px-8 pb-32 gap-12 lg:gap-24 relative z-10">
                    {/* Left Side: Content */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                        className="flex-1 text-center lg:text-left space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold tracking-widest uppercase text-cyan-400 theme-glass:text-purple-600 opacity-80">
                                {getGreeting()}, Bhumi
                            </h2>
                            <h1 className="text-6xl lg:text-8xl font-black font-display tracking-tighter leading-[0.9] text-slate-100 theme-glass:text-slate-900">
                                Next Generation <br />
                                <span className="theme-dark:neon-text-blue theme-glass:text-purple-600">AI Assistant.</span>
                            </h1>
                            <p className="text-xl lg:text-2xl font-medium text-slate-400 theme-glass:text-slate-600 max-w-xl">
                                Smarter. Faster. More Human. <br />
                                <span className="text-sm italic opacity-50">Initialized & Ready.</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4 justify-center lg:justify-start">
                            <button
                                onClick={() => createChat()}
                                className="btn-premium flex items-center justify-center gap-3 px-12 group"
                            >
                                Start Chatting
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/history')}
                                className="px-12 py-4 rounded-[20px] font-bold text-slate-400 border border-slate-700 hover:bg-slate-800/50 transition-all theme-glass:border-slate-200 theme-glass:text-slate-600"
                            >
                                View Nodes
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Side: Robot Image */}
                    <motion.div
                        initial={{ x: 100, opacity: 0, scale: 0.8 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                        className="flex-1 relative group"
                    >
                        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000" />
                        <img
                            src="/robot.png"
                            alt="AI Robot"
                            className="w-full h-auto max-w-2xl mx-auto relative z-10 animate-float drop-shadow-[0_0_50px_rgba(34,211,238,0.2)]"
                        />
                        {/* Glow reflection beneath robot */}
                        <div className="w-[60%] h-8 bg-black/40 blur-2xl mx-auto rounded-full mt-[-20px] opacity-50" />
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex-1 flex flex-col relative z-20 overflow-hidden h-full transition-all duration-700">
            {/* BACKGROUND DECOR */}
            <div className="bg-blob -top-20 -left-20 bg-purple-500/10" />
            <div className="bg-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/5" />

            {/* HEADER */}
            <div className="flex justify-between items-center px-10 py-6 glass-panel border-b border-t-0 border-x-0 rounded-none sticky top-0 z-50">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-[18px] theme-dark:bg-cyan-500/10 theme-glass:bg-purple-500/10 flex items-center justify-center border border-white/5 group-hover:rotate-12 transition-transform">
                        <Brain className="theme-dark:text-cyan-400 theme-glass:text-purple-600" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-display font-black text-slate-100 theme-glass:text-slate-900 tracking-tight leading-none mb-1">Neural Core</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Session Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={logout}
                        className="p-3 rounded-[16px] glass-panel hover:bg-red-500/10 text-slate-400 hover:text-red-500 border-none transition-all"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-6 py-10 space-y-12 custom-scrollbar scroll-smooth relative z-10">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "ai-bubble"}`}>
                                <div className="markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                {msg.role === "assistant" && (
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                            className="p-2 glass-panel border-none text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-cyan-400"
                                        >
                                            Copy Core
                                        </button>
                                        <button
                                            onClick={() => sendMessage('regenerate')}
                                            className="p-2 glass-panel border-none text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-purple-400"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="ai-bubble px-8 py-5 flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 opacity-50 mr-2">Thinking</span>
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:200ms]" />
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:400ms]" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </AnimatePresence>
            </div>

            {/* INPUT AREA */}
            <div className="p-8 pb-12 flex flex-col items-center relative z-20">
                {/* Prompt Suggestions / Smart Actions */}
                <div className="w-full max-w-4xl flex gap-3 mb-6 overflow-x-auto pb-3 custom-scrollbar">
                    {SMART_ACTIONS.map(act => (
                        <button
                            key={act.id}
                            onClick={() => sendMessage(act.id)}
                            disabled={loading}
                            className={`flex items-center gap-2 px-5 py-2.5 glass-panel border-white/5 rounded-2xl whitespace-nowrap text-xs font-bold text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all disabled:opacity-30`}
                        >
                            <span>{act.icon}</span>
                            {act.label}
                        </button>
                    ))}
                    <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Humanize</span>
                        <div className="w-10 h-5 bg-slate-800 rounded-full relative p-1 cursor-pointer hover:bg-slate-700 transition-colors">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-5xl relative group">
                    <div className="absolute inset-x-0 -top-20 h-40 bg-gradient-to-t from-[#020617] to-transparent theme-glass:from-white theme-glass:to-transparent pointer-events-none" />
                    <div className="relative flex items-end gap-3 glass-panel border-white/10 p-5 shadow-2xl focus-within:ring-1 focus-within:ring-cyan-500/50 group-hover:border-white/20">
                        <textarea
                            rows="1"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = e.target.scrollHeight + "px";
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 theme-glass:text-slate-800 pt-3 px-6 resize-none leading-relaxed text-base font-medium placeholder:text-slate-500 custom-scrollbar max-h-48"
                            placeholder="How can Kynara assist you today?"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="p-5 btn-premium !py-0 !h-14 !rounded-2xl group/btn"
                        >
                            <Send size={24} className="relative z-10" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

