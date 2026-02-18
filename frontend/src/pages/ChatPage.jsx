import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, MessageSquare, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setChats } = useChatContext(); // To update title
    const { logout, user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Scroll to bottom
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
                const res = await axios.get(`http://localhost:5000/api/chat/history/${id}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load chat", err);
                // Maybe redirect to / or show error
            }
        };
        loadChat();
    }, [id]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/chat", {
                message: userMessage.content,
                chatId: id,
            });

            const { reply, newTitle } = res.data;

            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

            if (newTitle) {
                // Update Sidebar Title via Context
                setChats(prev => prev.map(c => c._id === id ? { ...c, title: newTitle } : c));
            }
        } catch (err) {
            console.error("Chat Failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (!id) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-60">
                <img src="/logo.png" alt="Kynara Logo" className="w-32 h-32 object-contain mb-6 animate-float drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'User'}</h2>
                <p>Select a chat or start a new conversation.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col m-4 ml-0 glass-panel relative z-10 overflow-hidden">
            {/* HEADER */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-white/10 backdrop-blur-xl z-20">
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold opacity-90">Kynara AI</h2>
                    <span className="text-xs opacity-60">Session ID: {id.slice(-6)}</span>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={logout}
                        className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar scroll-smooth">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div
                            className={`max-w-3xl px-6 py-4 rounded-3xl shadow-sm backdrop-blur-sm ${msg.role === "user"
                                ? "bg-gradient-to-br from-accent-purple to-accent-deepPurple text-white rounded-br-sm shadow-accent-purple/20"
                                : "bg-white/40 dark:bg-white/5 border border-white/20 rounded-bl-sm prose prose-invert"
                                }`}
                        >
                            {msg.role === "user" ? (
                                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                            ) : (
                                <div className="markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white/20 px-6 py-4 rounded-3xl rounded-bl-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-6">
                <div className="relative flex items-center gap-3">
                    <input
                        className="input-glass pr-12 shadow-inner"
                        placeholder="Ask anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 p-2 bg-accent-deepPurple text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] opacity-40">AI can make mistakes. Check important info.</span>
                </div>
            </div>
        </div>
    );
}
