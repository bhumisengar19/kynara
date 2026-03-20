import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { AvatarModel } from './FloatingAvatar';
import { Mic, Volume2, VolumeX, MessageSquare, CheckCircle, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function AvatarPanel({ 
  isSpeaking, 
  isListening, 
  status, 
  onVoiceInput, 
  voiceEnabled, 
  toggleVoice,
  englishMode,
  setEnglishMode,
  subtitle,
  feedback
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const topics = [
    "Introduce yourself",
    "Job interview",
    "Travel conversation",
    "Daily small talk",
    "Debate practice"
  ];

  return (
    <div className={`w-[320px] h-full flex flex-col shrink-0 border-l backdrop-blur-3xl z-40 transition-colors duration-500
      ${theme === 'dark' ? 'bg-[#101014]/60 border-white/[0.05]' : 'bg-white/80 border-black/[0.05]'}
    `}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
         <div className="flex items-center gap-2">
            <GraduationCap className={englishMode ? 'text-indigo-400 animate-pulse' : 'text-gray-400'} size={18} />
            <h3 className={`font-semibold tracking-tight text-[15px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                English Coach
            </h3>
         </div>
         <button 
            onClick={() => setEnglishMode(!englishMode)}
            className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wide font-bold transition-all ${
                englishMode 
                ? 'bg-indigo-500 text-white shadow-md' 
                : (theme === 'dark' ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-black/5 text-gray-500 hover:bg-black/10')
            }`}
          >
            {englishMode ? 'Active' : 'Start'}
         </button>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[300px] relative overflow-hidden bg-transparent">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          </div>
        }>
          <Canvas camera={{ position: [0, 0, 3], fov: 40 }} className="w-full h-full">
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={1} angle={0.2} penumbra={1} />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />
            <Environment preset="city" />
            <AvatarModel 
              isSpeaking={isSpeaking} 
              isListening={isListening} 
              status={status} 
            />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2.5} far={4} />
          </Canvas>
        </Suspense>

        {/* Status Indicator Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-indigo-400 animate-pulse' : isListening ? 'bg-red-500 animate-pulse' : status !== 'online' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">
                {isSpeaking ? 'Speaking' : isListening ? 'Listening' : status !== 'online' ? 'Thinking' : 'Idle'}
            </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={`p-4 flex items-center justify-center gap-4 ${theme === 'dark' ? 'bg-[#151517]' : 'bg-gray-50'}`}>
            <button 
                onClick={onVoiceInput}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 ${isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : (theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-gray-900 border border-black/5')
                }`}
                title="Hold to Speak"
            >
                <Mic size={20} />
            </button>
            <button 
                onClick={toggleVoice}
                className={`p-3 rounded-full transition-all hover:scale-105 active:scale-95 border ${voiceEnabled 
                    ? (theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100') 
                    : (theme === 'dark' ? 'bg-transparent border-white/10 text-white/30 hover:bg-white/5' : 'bg-transparent border-black/5 text-gray-400 hover:bg-gray-100')
                }`}
                title={voiceEnabled ? "Mute Bot" : "Unmute Bot"}
            >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
      </div>

      {/* Subtitle / Transcript Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-transparent relative p-5">
        <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 opacity-50 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <MessageSquare size={12} /> Live Transcript
        </h4>
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-5 rounded-2xl border text-[13px] font-medium leading-relaxed italic shadow-sm
            ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05] text-white/80' : 'bg-gray-50 border-black/5 text-gray-700'}
        `}>
            {subtitle ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{subtitle}</motion.span>
            ) : (
                <span className="opacity-30">Waiting for conversation...</span>
            )}
        </div>
      </div>
      
      {/* Coach Feedback Section */}
      <AnimatePresence>
          {englishMode && feedback && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={feedback.correction}
              className={`mx-4 mb-4 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${
                feedback.correction.includes('Perfect') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                   {feedback.correction.includes('Perfect') ? 'Grammar Check' : 'Corrected Sentence'}
                 </span>
                 {feedback.correction.includes('Perfect') && <CheckCircle size={12} />}
              </div>
              
              <div className="text-[13px] font-bold leading-tight mb-2">
                 {feedback.correction}
              </div>
              
              {feedback.explanation && !feedback.correction.includes('Perfect') && (
                <div className={`text-[11px] opacity-70 leading-relaxed border-t pt-2 mt-2 font-medium ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
                   Coach: {feedback.explanation}
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* English Practice Topics (Only show if English Mode is on) */}
      <AnimatePresence>
        {englishMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`p-4 border-t ${theme === 'dark' ? 'border-white/5 bg-[#151517]' : 'border-black/5 bg-gray-50'}`}
          >
            <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                <CheckCircle size={12} /> Try These Topics
            </h4>
            <div className="flex flex-wrap gap-2">
                {topics.map((t, idx) => (
                    <button key={idx} className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98]
                        ${theme === 'dark' ? 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white/70 hover:text-white' : 'border-black/5 hover:border-indigo-500/30 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 bg-white'}
                    `}>
                        {t}
                    </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
