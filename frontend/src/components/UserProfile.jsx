
import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function UserProfile({ user, onBack, onLogout }) {
    if (!user) return <div className="p-8">No user data found.</div>;

    return (
        <div className="flex-1 flex flex-col p-10 bg-light-bg dark:bg-dark-bg m-6 rounded-[48px] shadow-[0_20px_60px_rgba(168,85,247,0.05)] relative overflow-hidden transition-colors duration-500">
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={onBack}
                    className="p-4 rounded-2xl bg-white dark:bg-dark-secondary shadow-sm hover:shadow-md transition-all text-purple-400"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-4xl font-display font-black text-light-text dark:text-dark-text tracking-tighter uppercase">
                    Profile Dashboard
                </h2>
            </div>

            <div className="max-w-xl w-full mx-auto">
                <div className="bg-white dark:bg-dark-secondary p-12 rounded-[48px] shadow-2xl shadow-purple-900/5 border border-purple-100 dark:border-white/5 relative">
                    <div className="flex flex-col items-center mb-12">
                        <div className="w-28 h-28 rounded-[36px] bg-purple-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-purple-500/20 mb-6">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <h3 className="text-2xl font-black text-light-text dark:text-dark-text">{user.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mt-2">Verified Member</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 block mb-3 pl-2">Email Address</label>
                            <div className="text-sm font-bold bg-purple-50/50 dark:bg-white/5 px-6 py-4 rounded-[20px] border border-purple-100 dark:border-white/5 text-light-text dark:text-dark-text">
                                {user.email}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 block mb-3 pl-2">Birthday</label>
                            <div className="text-sm font-bold bg-purple-50/50 dark:bg-white/5 px-6 py-4 rounded-[20px] border border-purple-100 dark:border-white/5 text-light-text dark:text-dark-text">
                                {user.dob ? new Date(user.dob).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Not set'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-purple-100 dark:border-white/5">
                        <button
                            onClick={onLogout}
                            className="w-full py-4 bg-red-50 dark:bg-red-950/20 text-red-500 font-black rounded-[24px] hover:bg-red-100 dark:hover:bg-red-950/40 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                            <LogOut size={18} />
                            Logout Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
