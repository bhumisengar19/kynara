import { useState, useEffect } from "react";
import {
    Search, LayoutGrid, Code, FileText, Image, FileCheck, Github,
    Database, BarChart, LayoutKanban, DollarSign, Share2,
    CheckCircle, Plus, Trash2, ExternalLink
} from "lucide-react";
import { useAppsContext } from "../context/AppsContext";
import { useNavigate } from "react-router-dom";

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

export default function AppsPage() {
    const { apps, installedApps, installApp, uninstallApp, fetchApps, loading } = useAppsContext();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchApps(searchTerm, selectedCategory === "All" ? "" : selectedCategory);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedCategory]);

    const isInstalled = (appId) => installedApps.some(app => app._id === appId);

    const categories = ["All", "Productivity", "Coding", "Design", "Research", "Finance", "Utilities"];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0F0B1F] text-white">
            {/* HEADER */}
            <div className="p-8 pb-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan mb-2">
                    App Center
                </h1>
                <p className="opacity-60">Discover powerful AI applications and integrations tailored for your workflow.</p>
            </div>

            {/* FILTERS */}
            <div className="px-8 pb-6 flex items-center gap-4 border-b border-white/10">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-accent-purple transition-colors"
                        placeholder="Search apps..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat
                                    ? "bg-accent-purple text-white"
                                    : "bg-white/5 hover:bg-white/10 text-white/60"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                {/* INSTALLED APPS */}
                {installedApps.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-400" />
                            Installed Apps
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {installedApps.map(app => (
                                <div key={app._id} className="glass-card p-4 rounded-xl flex items-center gap-4 group hover:bg-white/10 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                                        {(() => {
                                            const Icon = ICON_MAP[app.icon] || LayoutGrid;
                                            return <Icon size={24} className="text-accent-cyan" />;
                                        })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold truncate">{app.name}</h3>
                                        <p className="text-xs opacity-50 truncate">{app.description}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/apps/${app.route}`)}
                                            className="p-2 bg-accent-purple/20 text-accent-cyan rounded-lg hover:bg-accent-purple/40"
                                            title="Open App"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => uninstallApp(app._id)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                                            title="Uninstall"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BROWSE ALL */}
                <h2 className="text-xl font-semibold mb-4">Browse Apps</h2>
                {loading ? (
                    <div className="text-center opacity-50 py-10">Loading apps...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {apps.map(app => {
                            const installed = isInstalled(app._id);
                            return (
                                <div key={app._id} className="glass-card p-6 rounded-2xl flex flex-col hover:translate-y-[-4px] transition-transform duration-300">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4">
                                        {(() => {
                                            const Icon = ICON_MAP[app.icon] || LayoutGrid;
                                            return <Icon size={28} className="text-white" />;
                                        })()}
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{app.name}</h3>
                                        {installed && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Installed</span>}
                                    </div>
                                    <p className="text-sm opacity-60 mb-4 line-clamp-2 flex-1">{app.description}</p>

                                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                                        <span className="text-xs bg-white/5 px-2 py-1 rounded-md opacity-50">{app.category}</span>
                                        {installed ? (
                                            <button
                                                onClick={() => navigate(`/apps/${app.route}`)}
                                                className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                                            >
                                                Open
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => installApp(app._id)}
                                                className="px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-medium hover:bg-accent-deepPurple transition-all shadow-lg shadow-accent-purple/20 flex items-center gap-2"
                                            >
                                                <Plus size={16} /> Install
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
