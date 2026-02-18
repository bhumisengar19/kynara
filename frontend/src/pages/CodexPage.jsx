import { Code, Github, Terminal, GitBranch } from "lucide-react";

export default function CodexPage() {
    return (
        <div className="flex-1 p-8 glass-panel m-4 ml-0 relative overflow-hidden animate-in fade-in duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan flex items-center gap-3">
                        <Code size={32} className="text-accent-deepPurple" /> Codex
                    </h1>
                    <p className="opacity-60 text-sm">GitHub Integration Placeholder</p>
                </div>
                <button className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <Github size={18} /> Connect Repo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder Cards */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-6 opacity-60">
                        <div className="flex items-center gap-3 mb-4">
                            <GitBranch size={20} className="text-accent-cyan" />
                            <h3 className="font-bold">Repository_{i}</h3>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400 mb-4">
                            $ git status<br />
                            On branch main<br />
                            Your branch is up to date...
                        </div>
                        <div className="flex items-center justify-between text-xs opacity-50">
                            <span>Updated 2h ago</span>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>JS
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
