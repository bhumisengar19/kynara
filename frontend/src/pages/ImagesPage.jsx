import { Image, Sparkles, Filter } from "lucide-react";

export default function ImagesPage() {
    return (
        <div className="flex-1 p-8 glass-panel m-4 ml-0 relative overflow-hidden animate-in fade-in duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan flex items-center gap-3">
                        <Sparkles size={28} className="text-accent-cyan" /> Image Studio
                    </h1>
                    <p className="opacity-60 text-sm">Generate and edit AI masterpieces</p>
                </div>
                <button className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <Filter size={18} /> New Generation
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <Image size={64} className="mb-6 opacity-30" />
                <h2 className="text-xl font-semibold mb-2">No images generated yet</h2>
                <p className="max-w-xs text-center">Start creating by typing a prompt in the chat or using the studio tools coming soon.</p>
            </div>
        </div>
    );
}
