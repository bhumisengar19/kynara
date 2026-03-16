import React, { useState, useCallback } from 'react';
import { ArrowLeft, LogOut, Edit2, UploadCloud, X, Camera, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDropzone } from 'react-dropzone';

export default function UserProfile({ user, onBack, onLogout }) {
    const { updateProfile } = useAuth();
    const { theme } = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [dob, setDob] = useState(
        user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
    );
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profilePictureUrl || null);
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
        maxSize: 5 * 1024 * 1024, // 5MB limit
        multiple: false
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        if (dob) formData.append('dob', dob);
        if (file) formData.append('profilePicture', file);

        const res = await updateProfile(formData);
        setLoading(false);

        if (res.success) {
            setIsEditing(false);
            if (!file) setPreviewUrl(res.user.profilePictureUrl);
        } else {
            alert(res.error || "Failed to update profile");
        }
    };

    if (!user) return <div className="p-8">No user data found.</div>;

    return (
        <div className={`flex-1 flex flex-col p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto animate-in fade-in duration-500 custom-scrollbar ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-10 w-full">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`p-2.5 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                    >
                        <ArrowLeft size={22} className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'} />
                    </button>
                    <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                </div>
                
                <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-xl transition-all flex items-center gap-2 group border border-indigo-500/20"
                >
                    <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
                    Edit Profile
                </button>
            </div>

            {/* Profile Canvas */}
            <div className={`relative w-full rounded-[2rem] p-8 md:p-12 border shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-[#151517] border-white/5 shadow-black/50' : 'bg-white border-black/5 shadow-gray-200/50'}`}>
                
                {/* Background Glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
                    
                    {/* Avatar Display Section */}
                    <div className="flex flex-col items-center gap-4 shrink-0">
                        <div className="relative w-32 h-32 group cursor-pointer" onClick={() => setIsEditing(true)}>
                            {user.profilePictureUrl || previewUrl ? (
                                <img src={previewUrl || user.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover rounded-full shadow-xl ring-4 ring-white/10 dark:ring-white/5 transition-transform duration-300 group-hover:scale-[1.03]" />
                            ) : (
                                <div className="w-full h-full rounded-full shadow-xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center ring-4 ring-white/10 dark:ring-white/5 transition-transform duration-300 group-hover:scale-[1.03]">
                                    <span className="text-white font-bold text-4xl shadow-sm drop-shadow-md">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                </div>
                            )}

                            {/* Online Indicator */}
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-[#151517] dark:border-white shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                            
                            {/* Hover Edit Overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                                <Camera className="text-white drop-shadow-lg" size={28} />
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                            <ShieldCheck size={14} /> Identity Verified
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 w-full space-y-8 mt-2">
                        <div>
                            <h3 className="text-3xl font-extrabold tracking-tight mb-1">{user.name}</h3>
                            <p className={`text-sm font-medium tracking-wide ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                                Premium Membership • Access Level 4
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/[0.05]' : 'bg-gray-50 border-black/5'}`}>
                                <label className={`text-xs uppercase tracking-wider font-bold mb-1 block ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Email Address</label>
                                <div className="text-[15px] font-medium">{user.email}</div>
                            </div>
                            
                            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/[0.05]' : 'bg-gray-50 border-black/5'}`}>
                                <label className={`text-xs uppercase tracking-wider font-bold mb-1 block ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Date of Birth</label>
                                <div className="text-[15px] font-medium">
                                    {user.dob ? new Date(user.dob).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    }) : 'Not provided'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className={`mt-10 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                    <div className={`text-xs font-mono tracking-widest ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
                        NEURAL NODE: {user._id || user.id || 'N/A'}
                    </div>

                    <button
                        onClick={onLogout}
                        className={`px-6 py-3 font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 group ${
                            theme === 'dark' 
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20' 
                                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                        }`}
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Log Out Safely
                    </button>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border ${theme === 'dark' ? 'bg-[#151517] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'}`}>
                        
                        <button onClick={() => { setIsEditing(false); setPreviewUrl(user.profilePictureUrl); setFile(null); }} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-500/20 transition-colors">
                            <X size={20} />
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

                        <form onSubmit={handleSave} className="space-y-5">
                            {/* Avatar Upload Dropzone */}
                            <div className="flex flex-col items-center mb-6">
                                <div {...getRootProps()} className={`w-32 h-32 rounded-full relative cursor-pointer border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors group ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : (theme === 'dark' ? 'border-white/20 hover:border-indigo-400' : 'border-gray-300 hover:border-indigo-500')}`}>
                                    <input {...getInputProps()} />
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="text-white" /></div>
                                        </>
                                    ) : (
                                        <div className={`flex flex-col items-center gap-1 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>
                                            <UploadCloud size={24} className="group-hover:text-indigo-500 transition-colors" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                                        </div>
                                    )}
                                </div>
                                <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Drag & drop image (Max 5MB)</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block opacity-70">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/50 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500/30 focus:border-indigo-500'}`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block opacity-70">Email (Locked)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className={`w-full px-4 py-3 rounded-xl border cursor-not-allowed opacity-50 ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-gray-100 border-gray-200'}`}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block opacity-70">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/50 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500/30 focus:border-indigo-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-black/5 dark:border-white/10">
                                <button type="button" disabled={loading} onClick={() => { setIsEditing(false); setPreviewUrl(user.profilePictureUrl); setFile(null); }} className={`px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[120px]">
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
