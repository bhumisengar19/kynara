
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function UserProfile({ user, onBack }) {
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

            <div className="max-w-2xl w-full mx-auto space-y-8">
                <div className="glass-card bg-white/5 p-8 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-cyan/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="grid gap-8 relative z-10">
                        <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-3xl font-bold text-white shadow-lg">
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

                        <div className="pt-4 mt-2">
                            <div className="text-xs opacity-40 font-mono">
                                ID: {user._id || user.id || 'Unknown'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
