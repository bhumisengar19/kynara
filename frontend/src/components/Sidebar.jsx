import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
    Plus, MessageSquare, Archive, Trash2, RotateCcw,
    FolderArchive, User, LayoutGrid, Image, Code, Box, Folder, Search,
    FileText, FileCheck, Github, Database, BarChart, LayoutKanban, DollarSign, Share2
} from "lucide-react";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useAppsContext } from "../context/AppsContext";

const ICON_MAP = {
    "Code": Code,
    "FileText": FileText,
    "Image": Image,
    "FileCheck": FileCheck,
    "Github": Github,
    "Database": Database,
    "BarChart": BarChart,
    "LayoutKanban": LayoutKanban,
    "DollarSign": DollarSign,
    "Share2": Share2
};

export default function Sidebar() {
    const {
        chats, archivedChats, showArchived, setShowArchived,
        createChat, archiveChat, unarchiveChat, deleteChat
    } = useChatContext();
    const { user } = useAuth();
    const { installedApps } = useAppsContext(); // Fetch installed apps
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

    const menuItems = [
        { icon: LayoutGrid, label: "Apps", path: "/apps" },
        { icon: Image, label: "Images", path: "/images" },
        { icon: Code, label: "Codex", path: "/codex" },
        { icon: Box, label: "GPTs", path: "/gpts" },
        { icon: Folder, label: "Projects", path: "/projects" },
    ];

    return (
        <div className="w-80 m-4 flex flex-col glass-panel relative z-10 transition-all hidden md:flex">
            {/* HEADER */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <img src="/logo.png" alt="Kynara Logo" className="w-10 h-10 object-contain hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                    <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan">
                        Kynara
                    </Link>
                </div>

                <button
                    onClick={handleCreateChat}
                    className="w-full flex items-center justify-center gap-2 btn-primary group mb-4"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    New Chat
                </button>

                {/* SEARCH */}
                <div className="relative mb-4">
                    <input
                        className="input-glass w-full py-2 pl-9 pr-3 text-sm rounded-lg border border-white/10 bg-white/5 focus:bg-white/10 focus:border-accent-purple/50 transition-colors"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                </div>

                {/* NAVIGATION LINKS */}
                <div className="grid grid-cols-5 gap-2 mb-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-accent-cyan border border-white/10' : 'hover:bg-white/10 opacity-60 hover:opacity-100'}`}
                            title={item.label}
                        >
                            <item.icon size={18} />
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* INSTALLED APPS SHORTCUTS */}
            {installedApps && installedApps.length > 0 && (
                <div className="px-6 py-2 flex gap-2 overflow-x-auto hide-scrollbar border-b border-white/10">
                    {installedApps.filter(a => a.isEnabled).map(app => {
                        const Icon = ICON_MAP[app.icon] || LayoutGrid;
                        return (
                            <NavLink
                                key={app._id}
                                to={`/apps/${app.route}`}
                                className={({ isActive }) => `w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20' : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'}`}
                                title={app.name}
                            >
                                <Icon size={16} />
                            </NavLink>
                        );
                    })}
                </div>
            )}

            {/* ARCHIVED HEADER */}
            {showArchived && (
                <div className="px-4 py-2 bg-accent-deepPurple/10 text-xs font-bold uppercase tracking-wider flex justify-between items-center text-accent-cyan">
                    <span>Archived</span>
                    <button onClick={() => setShowArchived(false)} className="hover:text-white">Close</button>
                </div>
            )}

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {filteredChats.map((chat) => (
                    <div
                        key={chat._id}
                        onClick={() => navigate(`/c/${chat._id}`)}
                        className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 group relative ${id === chat._id
                            ? "bg-white/20 shadow-lg border border-white/20"
                            : "hover:bg-white/10 hover:translate-x-1"
                            }`}
                    >
                        <MessageSquare size={18} className="opacity-70 group-hover:opacity-100 shrink-0" />
                        <span className="truncate font-medium opacity-80 group-hover:opacity-100 flex-1 pr-14">
                            {chat.title}
                        </span>

                        {/* HOVER ACTIONS */}
                        <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            {showArchived ? (
                                <>
                                    <button
                                        onClick={() => unarchiveChat(chat._id)}
                                        className="p-1.5 hover:bg-green-500/20 text-green-400 rounded-md"
                                        title="Restore"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteChat(chat._id)}
                                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => archiveChat(chat._id)}
                                        className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-md"
                                        title="Archive"
                                    >
                                        <Archive size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteChat(chat._id)}
                                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {showArchived && archivedChats.length === 0 && (
                    <div className="text-center opacity-40 text-sm mt-10">No archived chats</div>
                )}
                {!showArchived && filteredChats.length === 0 && searchTerm && (
                    <div className="text-center opacity-40 text-sm mt-10">No chats found</div>
                )}
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-white/10 mt-auto space-y-2">
                {!showArchived && (
                    <button
                        onClick={() => setShowArchived(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-sm opacity-60 hover:opacity-100"
                    >
                        <FolderArchive size={18} />
                        <span>Archived Chats</span>
                    </button>
                )}

                <NavLink
                    to="/profile"
                    className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-xl transition-colors group text-left ${isActive ? "bg-white/20 border border-white/20" : "hover:bg-white/10"
                        }`}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white font-bold shadow-md shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate group-hover:text-accent-cyan transition-colors">
                            {user?.name || 'User'}
                        </div>
                        <div className="text-xs opacity-60 truncate">View Profile</div>
                    </div>
                </NavLink>
            </div>
        </div>
    );
}
