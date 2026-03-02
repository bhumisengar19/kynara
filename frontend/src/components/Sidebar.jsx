import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
    Plus, MessageSquare, Archive, Trash2, RotateCcw,
    FolderArchive, User, Search, LogOut
} from "lucide-react";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Sidebar() {
    const {
        chats, archivedChats, showArchived, setShowArchived,
        createChat, archiveChat, unarchiveChat, deleteChat
    } = useChatContext();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.pathname.startsWith('/c/') ? location.pathname.split('/')[2] : null;

    const [searchTerm, setSearchTerm] = useState("");

    const handleCreateChat = async () => {
        console.log("New Chat button clicked");
        const newId = await createChat();
        console.log("New Chat ID created:", newId);
        if (newId) navigate(`/c/${newId}`);
    };

    const filteredChats = (showArchived ? archivedChats : chats).filter(chat =>
        chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-76 flex flex-col sidebar-panel relative z-10 transition-all hidden md:flex h-full shadow-[10px_0_30px_rgba(126,34,206,0.03)]">
            {/* HEADER */}
            <div className="p-10 pb-6">
                <div className="flex items-center gap-3 mb-10 group">
                    <div className="w-11 h-11 bg-accent-purple rounded-[18px] flex items-center justify-center text-white shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                        <MessageSquare size={22} className="fill-white/20" />
                    </div>
                    <Link to="/" className="text-3xl font-display font-black text-light-text dark:text-dark-text tracking-tighter hover:opacity-80 transition-opacity">
                        Kynara
                    </Link>
                </div>

                <button
                    onClick={handleCreateChat}
                    className="w-full flex items-center justify-center gap-3 py-5 px-6 bg-accent-purple text-white font-black rounded-[24px] hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none group/btn relative overflow-hidden text-sm uppercase tracking-widest"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                    <Plus size={22} className="relative z-10" />
                    <span className="relative z-10">Neural Node</span>
                </button>

                {/* SEARCH */}
                <div className="relative mt-8 group/search">
                    <input
                        className="w-full py-4 pl-12 pr-4 text-sm font-bold rounded-[22px] border border-purple-100 dark:border-white/5 bg-purple-50/50 dark:bg-white/5 focus:bg-white dark:focus:bg-dark-secondary focus:ring-4 focus:ring-purple-500/5 focus:outline-none transition-all text-light-text dark:text-dark-text placeholder:text-purple-300 font-sans"
                        placeholder="Scan nodes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within/search:text-accent-purple transition-colors" />
                </div>
            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto px-6 space-y-3 custom-scrollbar">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 mb-4 px-2">Recent Chats</div>
                {filteredChats.map((chat) => (
                    <div
                        key={chat._id}
                        onClick={() => navigate(`/c/${chat._id}`)}
                        className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 group relative border ${id === chat._id
                            ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 shadow-sm"
                            : "bg-transparent border-transparent hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                            }`}
                    >
                        <div className={`p-2 rounded-xl transition-colors ${id === chat._id ? 'bg-white dark:bg-purple-900/50 text-purple-600' : 'bg-purple-50 dark:bg-white/5 text-purple-300 group-hover:text-purple-500'}`}>
                            <MessageSquare size={16} />
                        </div>
                        <span className={`truncate font-bold text-sm flex-1 ${id === chat._id ? 'text-purple-700 dark:text-white' : 'text-light-text/60 group-hover:text-light-text dark:group-hover:text-white'}`}>
                            {chat.title}
                        </span>

                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => archiveChat(chat._id)} className="p-2 text-purple-300 hover:text-amber-500 transition-colors">
                                <Archive size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-purple-100 dark:border-white/5 mt-auto space-y-4">
                <NavLink
                    to="/profile"
                    className={({ isActive }) => `w-full flex items-center gap-4 p-4 rounded-[28px] transition-all group ${isActive ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50" : "hover:bg-purple-50/50 dark:hover:bg-white/5"}`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shrink-0 overflow-hidden">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-light-text dark:text-dark-text truncate">
                            {user?.name || 'User'}
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-widest text-purple-400">Personal</div>
                    </div>
                </NavLink>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-purple-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold text-xs"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    );
}
