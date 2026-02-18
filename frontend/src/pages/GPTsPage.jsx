import { Box, Bot, Sparkles, Code } from "lucide-react";

export default function GPTsPage() {
    return (
        <div className="flex-1 p-8 glass-panel m-4 ml-0 relative overflow-hidden animate-in fade-in duration-300 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center mb-6 shadow-lg shadow-accent-cyan/20 animate-float">
                <Bot size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan mb-4">
                Custom GPTs
            </h1>
            <p className="text-lg opacity-60 max-w-md text-center mb-8">
                Build and deploy custom GPT agents for specialized tasks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                <div className="glass-card p-6 flex flex-col items-center hover:bg-white/10 transition-colors cursor-pointer">
                    <Sparkles size={32} className="text-yellow-400 mb-4" />
                    <h3 className="font-bold">Creative Writer</h3>
                    <p className="text-xs opacity-50 text-center mt-2">Specialized in story, plot, and script generation.</p>
                </div>
                <div className="glass-card p-6 flex flex-col items-center hover:bg-white/10 transition-colors cursor-pointer">
                    <Code size={32} className="text-accent-cyan mb-4" />
                    <h3 className="font-bold">Code Architect</h3>
                    <p className="text-xs opacity-50 text-center mt-2">Expert in system design and clean code practices.</p>
                </div>
            </div>
        </div>
    );
}


