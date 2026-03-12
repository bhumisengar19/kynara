
import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function UserProfile({ user, onBack, onLogout }) {
    if (!user) return <div className="p-8">No user data found.</div>;

    return (
        <div className="flex-1 flex flex-col p-8 glass-panel m-4 ml-0 relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan">
                    Your Profile
                </h2>
            </div>

            <div className="max-w-2xl w-full mx-auto space-y-6">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <div className="grid gap-8 relative z-10">
                        <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{user.name}</h3>
                                <p className="opacity-60">Member since {new Date().getFullYear()}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs uppercase tracking-wider opacity-50 font-semibold block mb-2">Email Address</label>
                                <div className="text-lg bg-white/5 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm">
                                    {user.email}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-wider opacity-50 font-semibold block mb-2">Date of Birth</label>
                                <div className="text-lg bg-white/5 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm">
                                    {user.dob ? new Date(user.dob).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Not provided'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 mt-6 border-t border-white/10 flex flex-col gap-4">
                            <button
                                onClick={onLogout}
                                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2 group"
                            >
                                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                                Logout Session
                            </button>
                            <div className="text-xs opacity-40 font-mono text-center">
                                Neural Identity ID: {user._id || user.id || 'Unknown'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
