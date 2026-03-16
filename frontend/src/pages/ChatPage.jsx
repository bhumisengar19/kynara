import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, Sparkles, Brain, Zap, Paperclip, X, FileText, Image as ImageIcon, Copy, RefreshCw, ThumbsUp, ThumbsDown, Bookmark, Share2, Check, Mic, Volume2, VolumeX, Globe, FastForward, UserCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { BotScene } from "../components/BotScene";
import FloatAvatarContainer from "../components/FloatAvatarContainer";

const PERSONAS = [
    { id: "balanced", label: "Balanced", icon: Sparkles, color: "from-indigo-400 to-violet-400" },
    { id: "creative", label: "Creative", icon: Zap, color: "from-pink-400 to-lavender-400" },
    { id: "technical", label: "Technical", icon: Brain, color: "from-cyan-400 to-blue-400" },
];

export default function ChatPage() {
    const { id } = useParams();
    const { setChats, createChat } = useChatContext();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { theme } = useTheme();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("online"); // online, thinking, generating
    const [persona, setPersona] = useState(PERSONAS[0]);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [deepSearch, setDeepSearch] = useState(false);
    const [conciseMode, setConciseMode] = useState(false);
    const [showAvatar, setShowAvatar] = useState(true);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setAttachments(prev => [...prev, {
                url: res.data.fileUrl,
                name: file.name,
                fileType: file.type || 'application/octet-stream'
            }]);
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

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
            setMessages([]); // Clear previous messages
            try {
                const res = await api.get(`/chat/history/${id}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load chat", err);
            }
        };
        loadChat();
    }, [id]);

    const sendMessage = async () => {
        if (!input.trim() && attachments.length === 0) return;

        const userMessage = {
            role: "user",
            content: input,
            attachments: attachments
        };

        // Optimistically add message to UI
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        const currentAttachments = [...attachments];

        setInput("");
        setAttachments([]);
        setLoading(true);

        try {
            setStatus("thinking");
            // Switch to generating after 2 seconds to simulate phase transition
            const timer = setTimeout(() => setStatus("generating"), 2000);

            const res = await api.post("/chat", {
                message: userMessage.content,
                chatId: id,
                persona: persona.id,
                deepSearch,
                conciseMode,
                attachments: currentAttachments
            });

            clearTimeout(timer);
            const { reply, newTitle } = res.data;
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

            if (newTitle) {
                setChats(prev => prev.map(c => c._id === id ? { ...c, title: newTitle } : c));
            }
            
            // Trigger Voice Response immediately if enabled
            if (voiceEnabled) {
                speakResponse(reply);
            }
        } catch (err) {
            console.error("Chat Failed", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: `⚠️ **Error**: ${errorMsg}`
            }]);
            // Restore input on failure
            setInput(currentInput);
            setAttachments(currentAttachments);
        } finally {
            setLoading(false);
            setStatus("online");
        }
    };

    // --- Voice Logic ---
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.start();
    };

    const speakResponse = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const toggleVoice = () => {
        setVoiceEnabled(!voiceEnabled);
        if (voiceEnabled) window.speechSynthesis.cancel();
    };

    const handleAction = async (action, originalMsg, msgId) => {
        if (action === 'copy') {
            navigator.clipboard.writeText(originalMsg);
            return;
        }

        if (action === 'regenerate') {
            setLoading(true);
            setStatus("thinking");
            try {
                const res = await api.post("/chat", {
                    message: originalMsg,
                    chatId: id,
                    action: 'regenerate',
                    persona: persona.id
                });
                const { reply } = res.data;
                setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            } catch (err) {
                console.error("Regeneration failed", err);
            } finally {
                setLoading(false);
                setStatus("online");
            }
            return;
        }

        if (action === 'save') {
            const element = document.createElement("a");
            const file = new Blob([originalMsg], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `kynara-response-${Date.now()}.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            return;
        }

        if (action === 'share') {
            if (navigator.share) {
                navigator.share({
                    title: 'Kynara AI Response',
                    text: originalMsg,
                    url: window.location.href,
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Chat link copied to clipboard!");
            }
            return;
        }

        if (action === 'speak') {
            speakResponse(originalMsg);
            return;
        }
    };

    if (!id) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col relative overflow-hidden"
            >
                <div className="absolute top-8 right-8 z-50">
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-4xl text-center">
                        <BotScene onInitialize={async () => {
                            const newId = await createChat();
                            if (newId) navigate(`/c/${newId}`);
                        }} />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col relative z-20 overflow-hidden h-full transition-all duration-500`}>
            {/* HEADER */}
            <div className={`flex justify-between items-center px-8 py-4 backdrop-blur-xl sticky top-0 z-30 border-b ${theme === 'dark'
                ? 'bg-kynaraDark-navy/30 border-white/5 shadow-neon'
                : 'bg-kynaraLight-bg/40 border-kynaraLight-lavender shadow-sm'
                }`}>
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-2xl bg-gradient-to-br ${persona.color} shadow-lg shadow-indigo-500/20`}>
                        <persona.icon className="text-white" size={20} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <h2 className={`text-base font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`}>Kynara AI</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500 ${status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                status === 'thinking' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' :
                                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                                }`}></span>
                            <span className={`text-[10px] opacity-70 font-semibold tracking-wide uppercase ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`}>
                                {status === 'online' ? 'Online' :
                                    status === 'thinking' ? 'Thinking' :
                                        'Generating response'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleVoice}
                        className={`p-2.5 rounded-xl transition-all ${voiceEnabled
                            ? (theme === 'dark' ? 'text-kynaraDark-lavender bg-white/5' : 'text-kynaraLight-pink bg-black/5')
                            : 'opacity-40 hover:opacity-100'
                            }`}
                        title={voiceEnabled ? "Voice response ON" : "Voice response OFF"}
                    >
                        {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <ThemeToggle />
                    <button
                        onClick={logout}
                        className="p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-70 hover:opacity-100"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar scroll-smooth">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={theme === 'dark' ? { opacity: 0, scale: 0.9 } : { opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`group max-w-[85%] lg:max-w-3xl px-6 py-4 rounded-[2rem] backdrop-blur-2xl relative transition-all duration-500 ${msg.role === "user"
                                    ? theme === 'dark'
                                        ? "bg-gradient-to-br from-kynaraDark-midnight to-kynaraDark-indigo text-white rounded-br-none shadow-[0_0_20px_rgba(192,132,252,0.2)] border border-kynaraDark-lavender/30"
                                        : "bg-kynaraLight-pink/40 text-kynaraLight-text rounded-br-none border border-white shadow-soft"
                                    : theme === 'dark'
                                        ? "bg-kynaraDark-card text-kynaraDark-text border border-white/10 rounded-bl-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] prose-invert"
                                        : "bg-kynaraLight-card text-kynaraLight-text border border-kynaraLight-lavender/30 rounded-bl-none shadow-glass"
                                    }`}
                            >
                                {msg.role === "user" ? (
                                    <div className="whitespace-pre-wrap font-medium leading-relaxed">{msg.content}</div>
                                ) : (
                                    <div className="markdown-content prose prose-sm max-w-none">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({node, inline, className, children, ...props}) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            {...props}
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            className="rounded-xl my-4 text-sm shadow-xl border border-white/10"
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code {...props} className={className + " bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-pink-500 dark:text-pink-300 font-mono"}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {msg.attachments?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {msg.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-2 p-3 rounded-2xl border transition-all hover:scale-[1.02] ${theme === 'dark'
                                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    : 'bg-white/50 border-kynaraLight-lavender hover:bg-white'
                                                    }`}
                                            >
                                                {file.fileType.startsWith('image/') ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-kynaraDark-lavender/20 text-kynaraDark-lavender' : 'bg-kynaraLight-pink/20 text-kynaraLight-text'
                                                        }`}>
                                                        <FileText size={20} />
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="text-xs font-bold truncate max-w-[120px]">{file.name}</span>
                                                    <span className="text-[10px] opacity-50 uppercase">{file.fileType.split('/')[1] || 'FILE'}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {msg.role === "assistant" && (
                                    <div className={`flex items-center gap-1 mt-4 pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-kynaraLight-lavender/30'}`}>
                                        <MessageToolButton
                                            icon={Copy}
                                            onClick={() => handleAction('copy', msg.content)}
                                            label="Copy"
                                            theme={theme}
                                        />
                                        <MessageToolButton
                                            icon={RefreshCw}
                                            onClick={() => handleAction('regenerate', messages[i - 1]?.content || msg.content)}
                                            label="Regenerate"
                                            theme={theme}
                                        />
                                        <div className="w-px h-4 mx-1 opacity-10 bg-current" />
                                        <MessageToolButton
                                            icon={ThumbsUp}
                                            label="Helpful"
                                            theme={theme}
                                            toggleable
                                        />
                                        <MessageToolButton
                                            icon={ThumbsDown}
                                            label="Not helpful"
                                            theme={theme}
                                            toggleable
                                        />
                                        <div className="w-px h-4 mx-1 opacity-10 bg-current" />
                                        <MessageToolButton
                                            icon={Bookmark}
                                            onClick={() => handleAction('save', msg.content)}
                                            label="Save"
                                            theme={theme}
                                        />
                                        <MessageToolButton
                                            icon={Volume2}
                                            onClick={() => handleAction('speak', msg.content)}
                                            label="Listen"
                                            theme={theme}
                                        />
                                        <MessageToolButton
                                            icon={Share2}
                                            onClick={() => handleAction('share', msg.content)}
                                            label="Share"
                                            theme={theme}
                                        />
                                    </div>
                                )}

                                <div className={`absolute -bottom-6 text-[10px] opacity-0 group-hover:opacity-40 transition-opacity ${msg.role === "user" ? "right-0" : "left-0"} ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`}>
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className={`px-8 py-5 rounded-[2rem] rounded-bl-none flex gap-1.5 items-center backdrop-blur-xl ${theme === 'dark' ? 'bg-kynaraDark-indigo/40 border border-white/5' : 'bg-kynaraLight-lavender/30 border border-white'
                            }`}>
                            {theme === 'dark' ? (
                                <>
                                    <span className="w-1.5 h-1.5 bg-kynaraDark-lavender rounded-full animate-twinkle" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-kynaraDark-lavender rounded-full animate-twinkle" style={{ animationDelay: '200ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-kynaraDark-lavender rounded-full animate-twinkle" style={{ animationDelay: '400ms' }}></span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 bg-kynaraLight-mint rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-kynaraLight-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-kynaraLight-lavender rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-6 md:p-8 pt-0 bg-transparent">
                <div className="max-w-5xl mx-auto container relative">
                    {/* Attachment Previews */}
                    <AnimatePresence>
                        {attachments.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="flex flex-wrap gap-2 mb-4"
                            >
                                {attachments.map((file, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border group relative ${theme === 'dark' ? 'bg-kynaraDark-card border-white/10' : 'bg-white/80 border-kynaraLight-lavender'
                                            }`}
                                    >
                                        {file.fileType.startsWith('image/') ? (
                                            <ImageIcon size={14} className="text-kynaraLight-pink" />
                                        ) : (
                                            <FileText size={14} className="text-kynaraLight-lavender" />
                                        )}
                                        <span className="text-xs font-medium truncate max-w-[100px]">{file.name}</span>
                                        <button
                                            onClick={() => removeAttachment(i)}
                                            className="ml-1 opacity-40 hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative flex items-center group">
                        {theme === 'dark' && (
                            <div className="absolute inset-0 bg-kynaraDark-lavender/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.csv,.txt"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className={`absolute left-4 p-2 rounded-xl transition-all z-50 cursor-pointer ${theme === 'dark'
                                ? 'text-white/40 hover:text-kynaraDark-lavender hover:bg-white/5'
                                : 'text-kynaraLight-text/40 hover:text-kynaraLight-pink hover:bg-black/5'
                                } ${uploading ? 'animate-pulse' : ''}`}
                        >
                            <Paperclip size={20} />
                        </button>

                        <button
                            onClick={handleVoiceInput}
                            className={`absolute left-14 p-2 rounded-xl transition-all z-50 cursor-pointer ${isListening
                                ? 'text-red-500 bg-red-500/10 animate-pulse'
                                : (theme === 'dark' ? 'text-white/40 hover:text-kynaraDark-lavender hover:bg-white/5' : 'text-kynaraLight-text/40 hover:text-kynaraLight-pink hover:bg-black/5')
                                }`}
                            title="Voice Input"
                        >
                            <Mic size={20} />
                        </button>

                        <button
                            onClick={() => { setDeepSearch(!deepSearch); setConciseMode(false); }}
                            className={`absolute left-24 p-2 rounded-xl transition-all z-50 cursor-pointer ${deepSearch
                                ? 'text-indigo-500 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                : (theme === 'dark' ? 'text-white/40 hover:text-indigo-400 hover:bg-white/5' : 'text-kynaraLight-text/40 hover:text-indigo-500 hover:bg-black/5')
                                }`}
                            title={deepSearch ? "Deep Search Enabled" : "Enable Deep Search"}
                        >
                            <Globe size={20} className={deepSearch ? 'animate-pulse' : ''} />
                        </button>
                        
                        <button
                            onClick={() => { setConciseMode(!conciseMode); setDeepSearch(false); }}
                            className={`absolute left-[8.5rem] p-2 rounded-xl transition-all z-50 cursor-pointer ${conciseMode
                                ? 'text-yellow-500 bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                                : (theme === 'dark' ? 'text-white/40 hover:text-yellow-400 hover:bg-white/5' : 'text-kynaraLight-text/40 hover:text-yellow-500 hover:bg-black/5')
                                }`}
                            title={conciseMode ? "Concise Mode Enabled" : "Enable Concise Mode (1-Word/1-Line Answer)"}
                        >
                            <FastForward size={20} className={conciseMode ? 'animate-pulse' : ''} />
                        </button>

                        <button
                            onClick={() => setShowAvatar(!showAvatar)}
                            className={`absolute left-[11rem] p-2 rounded-xl transition-all z-50 cursor-pointer ${showAvatar
                                ? 'text-teal-500 bg-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.5)]'
                                : (theme === 'dark' ? 'text-white/40 hover:text-teal-400 hover:bg-white/5' : 'text-kynaraLight-text/40 hover:text-teal-500 hover:bg-black/5')
                                }`}
                            title={showAvatar ? "Hide AI Avatar" : "Show AI Avatar"}
                        >
                            <UserCircle size={20} className={showAvatar ? 'animate-pulse' : ''} />
                        </button>

                        <textarea
                            rows="1"
                            className={`w-full backdrop-blur-2xl border rounded-3xl py-5 pl-[13.5rem] pr-16 focus:outline-none transition-all resize-none shadow-2xl placeholder:opacity-40 font-medium ${theme === 'dark'
                                ? 'bg-kynaraDark-navy/60 border-white/10 text-white focus:ring-1 focus:ring-kynaraDark-lavender/50'
                                : 'bg-kynaraLight-card text-kynaraLight-text border-kynaraLight-lavender focus:ring-2 focus:ring-kynaraLight-pink/30'
                                } ${deepSearch ? (theme === 'dark' ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]') : conciseMode ? (theme === 'dark' ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]') : ''}  ${status === 'generating' ? 'animate-pulse' : ''}`}
                            placeholder={conciseMode ? `Fast Answer mode...` : deepSearch ? `Deep Search with ${persona.label}...` : `Ask ${persona.label} AI...`}
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
                        />
                        <button
                            onClick={sendMessage}
                            disabled={(!input.trim() && attachments.length === 0) || loading || uploading}
                            className={`absolute right-4 p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-xl z-50 cursor-pointer ${theme === 'dark'
                                ? 'bg-gradient-to-r from-kynaraDark-lavender to-kynaraDark-violet text-white shadow-kynaraDark-lavender/20'
                                : 'bg-gradient-to-r from-kynaraLight-pink to-kynaraLight-lavender text-kynaraLight-text shadow-kynaraLight-pink/20'
                                }`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3D FLOATING AVATAR */}
            <AnimatePresence>
                {showAvatar && (
                    <FloatAvatarContainer 
                        isSpeaking={isSpeaking}
                        isListening={isListening}
                        status={status}
                        onVoiceInput={handleVoiceInput}
                        voiceEnabled={voiceEnabled}
                        toggleVoice={toggleVoice}
                        setVisible={setShowAvatar}
                    />
                )}
            </AnimatePresence>

        </div >
    );
}

function MessageToolButton({ icon: Icon, onClick, label, theme, toggleable }) {
    const [clicked, setClicked] = useState(false);
    const [active, setActive] = useState(false);

    const handleClick = (e) => {
        if (toggleable) {
            setActive(!active);
        } else {
            setClicked(true);
            setTimeout(() => setClicked(false), 2000);
        }
        if (onClick) onClick(e);
    };

    return (
        <button
            onClick={handleClick}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 group/tool ${active
                ? (theme === 'dark' ? 'bg-kynaraDark-lavender/20 text-kynaraDark-lavender' : 'bg-kynaraLight-pink/20 text-kynaraLight-text')
                : (theme === 'dark'
                    ? 'hover:bg-white/5 text-white/40 hover:text-kynaraDark-lavender'
                    : 'hover:bg-black/5 text-kynaraLight-text/40 hover:text-kynaraLight-pink')
                }`}
            title={label}
        >
            {clicked && label === "Copy" ? <Check size={14} className="text-green-400" /> : <Icon size={14} className={`${active ? 'fill-current' : 'group-hover/tool:scale-110'} transition-transform`} />}
            <span className="text-[10px] font-bold uppercase tracking-wider hidden group-hover/tool:block animate-in fade-in slide-in-from-left-1">
                {clicked && label === "Copy" ? "Copied!" :
                    clicked && label === "Save" ? "Saved!" :
                        clicked && label === "Share" ? "Shared!" :
                            label}
            </span>
        </button>
    );
}

