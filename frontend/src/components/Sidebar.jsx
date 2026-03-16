import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
    Plus, MessageSquare, Archive, Trash2, RotateCcw,
    FolderArchive, User, Search, LogOut, Edit2, Check, X
} from "lucide-react";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

import { useTheme } from "../context/ThemeContext";

export default function Sidebar() {
    const {
        chats, archivedChats, showArchived, setShowArchived,
        createChat, archiveChat, unarchiveChat, renameChat, deleteChat
    } = useChatContext();
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.pathname.startsWith('/c/') ? location.pathname.split('/')[2] : null;

    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    const handleCreateChat = async () => {
        const newId = await createChat();
        if (newId) navigate(`/c/${newId}`);
    };

    const handleRename = (e, chatId, currentTitle) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(chatId);
        setEditTitle(currentTitle);
    };

    const saveRename = async (e, chatId) => {
        e.preventDefault();
        e.stopPropagation();
        if (editTitle.trim()) {
            await renameChat(chatId, editTitle);
        }
        setEditingId(null);
    };

    const cancelRename = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(null);
    };

    const filteredChats = (showArchived ? archivedChats : chats).filter(chat =>
        chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`w-[260px] flex flex-col relative z-30 transition-all hidden md:flex h-full shrink-0 border-r ${theme === 'dark'
            ? 'bg-[#0a0a0b]/80 backdrop-blur-3xl border-white/[0.05]'
            : 'bg-[#f7f7f9]/80 backdrop-blur-3xl border-black/[0.05]'
            }`}>
            {/* HEADER */}
            <div className="p-4 px-5">
                <Link to="/" className="flex items-center gap-2 mb-6 pointer-events-auto group">
                    <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white ring-1 ring-white/20 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                        <span className="font-bold text-sm tracking-tight">K</span>
                    </div>
                    <span className={`font-semibold text-[15px] tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Kynara.ai
                    </span>
                </Link>

                <button
                    onClick={handleCreateChat}
                    className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 font-medium text-[14px] rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all group mb-5 relative pointer-events-auto cursor-pointer border ${theme === 'dark'
                        ? 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5 text-white shadow-sm'
                        : 'bg-white hover:bg-gray-50 border-black/5 text-gray-900 shadow-sm'
                        }`}
                >
                    <div className={`flex items-center justify-center p-1 rounded-md ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Plus size={16} className="transition-transform group-hover:rotate-90" />
                    </div>
                    New Thread
                </button>

                {/* SEARCH */}
                <div className="relative mb-5 group">
                    <input
                        className={`w-full py-2 pl-9 pr-3 text-[13px] rounded-lg border transition-all ${theme === 'dark'
                            ? 'bg-[#1a1a1c] border-white/[0.05] text-white/90 placeholder:text-white/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50'
                            : 'bg-white border-black/5 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/30'
                            } outline-none`}
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                </div>
                <div className="flex items-center justify-between px-2">
                    <h3 className={`text-[11px] font-semibold tracking-wide ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                        {showArchived ? "Archived" : "Previous 7 Days"}
                    </h3>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`p-1.5 rounded-md transition-all ${showArchived
                            ? 'bg-amber-500/10 text-amber-500'
                            : (theme === 'dark' ? 'text-white/30 hover:text-white/80 hover:bg-white/5' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100')
                            }`}
                        title={showArchived ? "Show Active" : "Show Archived"}
                    >
                        <FolderArchive size={14} />
                    </button>
                </div>
            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar pb-4">
                {filteredChats.map((chat) => (
                    <div
                        key={chat._id}
                        onClick={() => !editingId && navigate(`/c/${chat._id}`)}
                        className={`px-3 py-2 rounded-lg cursor-pointer flex items-center gap-3 transition-colors duration-200 group relative ${id === chat._id
                            ? theme === 'dark'
                                ? "bg-[#252528] text-white"
                                : "bg-[#eaeaec] text-gray-900 font-medium"
                            : theme === 'dark'
                                ? "hover:bg-[#1a1a1c] text-white/70 hover:text-white"
                                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                            }`}
                    >

                        {editingId === chat._id ? (
                            <div className="flex-1 flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                                <input
                                    autoFocus
                                    className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-kynaraLight-text'}`}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveRename(e, chat._id);
                                        if (e.key === 'Escape') cancelRename(e);
                                    }}
                                />
                                <button onClick={(e) => saveRename(e, chat._id)} className="p-1 hover:text-green-400"><Check size={14} /></button>
                                <button onClick={cancelRename} className="p-1 hover:text-red-400"><X size={14} /></button>
                            </div>
                        ) : (
                            <>
                                <span className={`truncate flex-1 pr-14 text-[13px] ${id === chat._id ? 'font-medium' : ''}`}>
                                    {chat.title || "Untitled Conversation"}
                                </span>

                                <div className="absolute right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={(e) => handleRename(e, chat._id, chat.title)} className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/10 text-black/50 hover:text-black'}`} title="Rename"><Edit2 size={13} /></button>

                                    {showArchived ? (
                                        <button onClick={() => unarchiveChat(chat._id)} className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-green-100 text-green-600'}`} title="Restore"><RotateCcw size={13} /></button>
                                    ) : (
                                        <button onClick={() => archiveChat(chat._id)} className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-amber-500/20 text-amber-400/80 hover:text-amber-400' : 'hover:bg-amber-100 text-amber-600'}`} title="Archive"><Archive size={13} /></button>
                                    )}

                                    <button onClick={() => deleteChat(chat._id)} className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400/80 hover:text-red-400' : 'hover:bg-red-100 text-red-600'}`} title="Delete"><Trash2 size={13} /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className={`p-3 mt-auto ${theme === 'dark' ? '' : ''}`}>
                <div className={`relative rounded-xl border p-1 ${theme === 'dark' ? 'bg-[#151517] border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `w-full flex items-center gap-3 p-2 rounded-lg transition-all group text-left relative ${isActive
                            ? theme === 'dark' ? "bg-white/5" : "bg-gray-100"
                            : theme === 'dark' ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"
                            }`}
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                            {user?.name ? <span className="text-white font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span> : <User size={16} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                            <div className={`font-semibold truncate text-[13px] tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {user?.name || 'Pro User'}
                            </div>
                            <div className={`text-[11px] truncate tracking-wide ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                                Premium Plan
                            </div>
                        </div>
                        
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
                            className={`absolute right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-900'}`}
                            title="Log out"
                        >
                            <LogOut size={14} />
                        </button>
                    </NavLink>
                </div>
            </div>
        </div>
    );
}
