import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, Sparkles, Brain, Zap, Paperclip, X, FileText, Image as ImageIcon, Copy, RefreshCw, ThumbsUp, ThumbsDown, Bookmark, Share2, Check, Mic, Volume2, VolumeX, Globe, FastForward, UserCircle, GraduationCap } from "lucide-react";
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
import AvatarPanel from "../components/AvatarPanel";

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
    const [showAvatar, setShowAvatar] = useState(false); // Hidden by default until activated
    const [englishMode, setEnglishMode] = useState(false);

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
                englishMode,
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

    // Derive subtitle
    const currentSubtitle = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || "";

    return (
        <div className="flex w-full h-full">
          <div className={`flex-1 flex flex-col relative z-20 min-w-0 overflow-hidden h-full transition-all duration-500`}>
              {/* HEADER */}
            <div className={`flex justify-between items-center px-6 py-4 backdrop-blur-md sticky top-0 z-30 transition-colors ${theme === 'dark'
                ? 'bg-[#0a0a0b]/80 border-b border-white/[0.05]'
                : 'bg-[#f7f7f9]/80 border-b border-black/[0.05]'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h2 className={`font-semibold text-[15px] tracking-tight ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Kynara.ai</h2>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${status === 'online' ? (theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600') :
                                status === 'thinking' ? (theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600') :
                                    (theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600')
                                }`}>
                                {status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAvatar(!showAvatar)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${showAvatar
                            ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]'
                            : (theme === 'dark' ? 'bg-white/10 text-white/80 hover:bg-white/20' : 'bg-black/5 text-kynaraLight-text hover:bg-black/10')
                            }`}
                    >
                        <GraduationCap size={16} className={showAvatar ? 'animate-bounce' : ''} />
                        <span className="hidden sm:inline">English Practice</span>
                    </button>
                    
                    <div className="w-px h-6 bg-gray-500/20 mx-1"></div>

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
            <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-8">
                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-4 shadow-sm mt-1 ring-1 ring-white/10">
                                        <Sparkles size={14} />
                                    </div>
                                )}
                                <div
                                    className={`group relative max-w-[85%] lg:max-w-2xl px-5 py-3.5 transition-all duration-300 ${msg.role === "user"
                                        ? theme === 'dark'
                                            ? "bg-[#252528] text-white/90 rounded-2xl rounded-br-sm"
                                            : "bg-gray-100 text-gray-900 rounded-2xl rounded-br-sm"
                                        : theme === 'dark'
                                            ? "bg-transparent text-white/90 prose-invert"
                                            : "bg-transparent text-gray-900"
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
                                    <div className={`flex items-center gap-1 mt-2 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
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

                                <div className={`absolute -bottom-5 text-[10px] opacity-0 group-hover:opacity-40 transition-opacity ${msg.role === "user" ? "right-1" : "left-1"} ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
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
                        <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-4 shadow-sm mt-1 ring-1 ring-white/10">
                            <Sparkles size={14} className="animate-spin" />
                        </div>
                        <div className={`px-5 py-4 rounded-2xl flex gap-1.5 items-center`}>
                            {theme === 'dark' ? (
                                <>
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                                </>
                            ) : (
                                <>
                                    <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-transparent mt-auto relative z-30">
                <div className="max-w-3xl mx-auto container relative">
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

                    <div className={`relative flex items-center group rounded-[24px] border transition-all duration-300 shadow-xl ${theme === 'dark' ? 'bg-[#151517] border-white/10 shadow-black/50 focus-within:border-white/20' : 'bg-white border-black/5 shadow-gray-200/50 focus-within:border-black/10'}`}>
                        
                        <div className="absolute left-2 flex items-center gap-1">
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
                                className={`p-2 rounded-full transition-all ${theme === 'dark'
                                    ? 'text-white/40 hover:text-white hover:bg-white/10'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                                    } ${uploading ? 'animate-pulse' : ''}`}
                            >
                                <Paperclip size={18} />
                            </button>

                            <button
                                onClick={handleVoiceInput}
                                className={`p-2 rounded-full transition-all ${isListening
                                    ? 'text-red-500 bg-red-500/10 animate-pulse'
                                    : (theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100')
                                    }`}
                                title="Voice Input"
                            >
                                <Mic size={18} />
                            </button>

                            <div className="w-px h-5 mx-0.5 opacity-20 bg-current pointer-events-none"></div>

                            <button
                                onClick={() => { setDeepSearch(!deepSearch); setConciseMode(false); }}
                                className={`p-2 rounded-full transition-all ${deepSearch
                                    ? 'text-indigo-400 bg-indigo-500/10'
                                    : (theme === 'dark' ? 'text-white/40 hover:text-indigo-400 hover:bg-white/10' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50')
                                    }`}
                                title={deepSearch ? "Deep Search Enabled" : "Enable Deep Search"}
                            >
                                <Globe size={18} />
                            </button>
                            
                            <button
                                onClick={() => { setConciseMode(!conciseMode); setDeepSearch(false); }}
                                className={`p-2 rounded-full transition-all ${conciseMode
                                    ? 'text-yellow-500 bg-yellow-500/10'
                                    : (theme === 'dark' ? 'text-white/40 hover:text-yellow-400 hover:bg-white/10' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50')
                                    }`}
                                title={conciseMode ? "Concise Mode Enabled" : "Enable Concise Mode"}
                            >
                                <FastForward size={18} />
                            </button>
                        </div>

                        <textarea
                            rows="1"
                            className={`w-full bg-transparent py-4 pl-[12rem] pr-14 focus:outline-none resize-none mx-2 text-[15px] ${theme === 'dark'
                                ? 'text-white/90 placeholder:text-white/30'
                                : 'text-gray-900 placeholder:text-gray-400'
                                } ${status === 'generating' ? 'animate-pulse' : ''}`}
                            placeholder={conciseMode ? `Fast Answer mode...` : deepSearch ? `Deep Search...` : `Message Kynara...`}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
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
                            className={`absolute right-2 p-2 rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 ${input.trim() || attachments.length > 0
                                ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white')
                                : (theme === 'dark' ? 'bg-white/10 text-white/50' : 'bg-black/5 text-black/30')
                                }`}
                        >
                            <Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />
                        </button>
                    </div>
                </div>
            </div>
          </div>
            
          {/* STATIC 3D AVATAR PANEL */}
          <AnimatePresence>
              {showAvatar && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="h-full shrink-0 flex flex-col"
                  >
                        <AvatarPanel 
                            isSpeaking={isSpeaking}
                            isListening={isListening}
                            status={status}
                            onVoiceInput={handleVoiceInput}
                            voiceEnabled={voiceEnabled}
                            toggleVoice={toggleVoice}
                            englishMode={englishMode}
                            setEnglishMode={setEnglishMode}
                            subtitle={currentSubtitle}
                        />
                   </motion.div>
              )}
          </AnimatePresence>

        </div>
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

