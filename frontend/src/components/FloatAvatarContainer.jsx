import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { AvatarModel } from './FloatingAvatar';
import { Mic, Volume2, VolumeX, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatAvatarContainer({ 
  isSpeaking, 
  isListening, 
  status, 
  onVoiceInput, 
  voiceEnabled, 
  toggleVoice,
  setVisible
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid SSR hydration issues if this is nextjs, but beneficial for Vite too.
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`fixed bottom-8 right-8 z-[100] w-[240px] flex flex-col items-center
        backdrop-blur-2xl bg-white/10 dark:bg-black/20 
        border border-white/20 dark:border-white/10 
        rounded-[2rem] shadow-[0_15px_35px_rgba(0,0,0,0.2)] 
        transition-all duration-500 hover:shadow-[0_20px_45px_rgba(126,87,194,0.3)]
        ${isSpeaking ? 'shadow-[0_0_30px_rgba(126,87,194,0.4)] border-indigo-500/50' : ''}
        ${isListening ? 'shadow-[0_0_30px_rgba(239,68,68,0.4)] border-red-500/50' : ''}
        ${status === 'thinking' || status === 'generating' ? 'shadow-[0_0_30px_rgba(234,179,8,0.3)] border-yellow-500/50' : ''}
      `}
    >
      <button 
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white z-10 transition-colors"
      >
        <X size={14} />
      </button>

      {/* 3D Canvas */}
      <div className="w-full h-[260px] relative rounded-t-[2rem] overflow-hidden mask-image-bottom-fade">
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
      </div>

      {/* Controls Bar */}
      <div className="w-full p-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between gap-2 bg-gradient-to-b from-transparent to-black/20 rounded-b-[2rem]">
         <div className="flex gap-2">
            <button 
                onClick={onVoiceInput}
                className={`p-2.5 rounded-xl transition-all shadow-lg ${isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]' 
                    : 'bg-white/10 hover:bg-white/20 text-indigo-100'
                }`}
            >
                <Mic size={18} />
            </button>
            <button 
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl transition-all shadow-lg ${voiceEnabled 
                    ? 'bg-white/10 hover:bg-white/20 text-indigo-400' 
                    : 'bg-white/5 opacity-50 text-white'
                }`}
            >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
         </div>
         
         {/* Status Indicator pulse */}
         <div className="flex items-center gap-2 pr-2">
            <div className={`w-2 h-2 rounded-full animate-pulse
                ${isSpeaking ? 'bg-indigo-400' : 
                  isListening ? 'bg-red-500' : 
                  status !== 'online' ? 'bg-yellow-400' : 
                  'bg-green-400'
                }
            `} />
            <span className="text-[10px] font-semibold tracking-wider uppercase opacity-70 text-white/90">
                {isSpeaking ? 'Speaking' : isListening ? 'Listening' : status !== 'online' ? 'Thinking' : 'Idle'}
            </span>
         </div>
      </div>
    </motion.div>
  );
}
