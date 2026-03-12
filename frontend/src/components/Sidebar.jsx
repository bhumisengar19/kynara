import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
    Plus, MessageSquare, Archive, Trash2, RotateCcw,
    FolderArchive, User, Search, LogOut
} from "lucide-react";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

import { useTheme } from "../context/ThemeContext";

export default function Sidebar() {
    const {
        chats, archivedChats, showArchived, setShowArchived,
        createChat, archiveChat, unarchiveChat, deleteChat
    } = useChatContext();
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.pathname.startsWith('/c/') ? location.pathname.split('/')[2] : null;

    const [searchTerm, setSearchTerm] = useState("");

    const handleCreateChat = async () => {
        const newId = await createChat();
        if (newId) navigate(`/c/${newId}`);
    };

    const filteredChats = (showArchived ? archivedChats : chats).filter(chat =>
        chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`w-72 flex flex-col backdrop-blur-3xl border-r relative z-30 transition-all hidden md:flex h-full ${theme === 'dark'
            ? 'bg-kynaraDark-navy/40 border-white/5 shadow-2xl shadow-black/50'
            : 'bg-kynaraLight-bg/40 border-kynaraLight-lavender shadow-glass'
            }`}>
            {/* HEADER */}
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/5' : 'border-kynaraLight-lavender'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-kynaraDark-lavender to-kynaraDark-violet' : 'bg-gradient-to-br from-kynaraLight-pink to-kynaraLight-lavender'
                        }`}>K</div>
                    <Link to="/" className={`text-2xl font-bold bg-clip-text text-transparent ${theme === 'dark' ? 'bg-gradient-to-r from-kynaraDark-lavender to-kynaraDark-indigo' : 'bg-gradient-to-r from-kynaraLight-pink to-kynaraLight-text'
                        }`}>
                        Kynara
                    </Link>
                </div>

                <button
                    onClick={handleCreateChat}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all group mb-6 relative z-[100] pointer-events-auto cursor-pointer ${theme === 'dark'
                        ? 'bg-gradient-to-r from-kynaraDark-lavender to-kynaraDark-violet text-white shadow-kynaraDark-lavender/20'
                        : 'bg-gradient-to-r from-kynaraLight-pink to-kynaraLight-lavender text-kynaraLight-text shadow-kynaraLight-pink/20'
                        }`}
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    New Chat
                </button>

                {/* SEARCH */}
                <div className="relative mb-4">
                    <input
                        className={`w-full py-2.5 pl-9 pr-3 text-sm rounded-xl border transition-all ${theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-kynaraDark-lavender/40'
                            : 'bg-kynaraLight-card border-kynaraLight-lavender text-kynaraLight-text placeholder:text-kynaraLight-text/40 focus:ring-1 focus:ring-kynaraLight-pink/50'
                            }`}
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`} />
                </div>
            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {filteredChats.map((chat) => (
                    <div
                        key={chat._id}
                        onClick={() => navigate(`/c/${chat._id}`)}
                        className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all duration-300 group relative ${id === chat._id
                            ? theme === 'dark'
                                ? "bg-white/10 border border-white/10 shadow-lg text-white"
                                : "bg-kynaraLight-pink/20 border border-kynaraLight-lavender shadow-sm text-kynaraLight-text"
                            : theme === 'dark'
                                ? "hover:bg-white/5 text-white/60 hover:text-white"
                                : "hover:bg-kynaraLight-lavender/20 text-kynaraLight-text/60 hover:text-kynaraLight-text"
                            }`}
                    >
                        <MessageSquare size={18} className="opacity-70 group-hover:opacity-100 shrink-0" />
                        <span className="truncate font-medium flex-1 pr-14 text-sm">
                            {chat.title}
                        </span>

                        <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => archiveChat(chat._id)} className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-lg"><Archive size={14} /></button>
                            <button onClick={() => deleteChat(chat._id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className={`p-4 border-t mt-auto space-y-2 ${theme === 'dark' ? 'border-white/5' : 'border-kynaraLight-lavender'}`}>
                <NavLink
                    to="/profile"
                    className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-2xl transition-all group text-left ${isActive
                        ? theme === 'dark' ? "bg-white/10 border border-white/10" : "bg-kynaraLight-pink/20 border border-kynaraLight-lavender"
                        : "hover:bg-white/5"
                        }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg shrink-0 group-hover:scale-110 transition-transform ${theme === 'dark' ? 'bg-gradient-to-br from-kynaraDark-lavender to-kynaraDark-violet' : 'bg-gradient-to-br from-kynaraLight-pink to-kynaraLight-lavender'
                        }`}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate text-sm ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`}>
                            {user?.name || 'User'}
                        </div>
                        <div className="text-[10px] opacity-60 truncate">Identity Verified</div>
                    </div>
                </NavLink>

                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-sm opacity-60 hover:opacity-100 group border border-transparent ${theme === 'dark' ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-red-500/5 hover:text-red-500'
                        }`}
                >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </div>
    );
}
