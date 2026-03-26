import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./context/AuthContext";
import Background3D from "./components/Background3D";
import { User, Mail, Lock, Calendar, ArrowRight, ShieldCheck, Sparkles, Globe, Cpu } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 5
  })), []);

  const handleAuth = async () => {
    if (isForgotPassword) {
      if (!email) { alert("Please enter your email"); return; }
    } else if (isRegister) {
      if (!name || !email || !password) { alert("Please fill all required fields"); return; }
    } else {
      if (!email || !password) { alert("Fill all fields"); return; }
    }

    setLoading(true);

    try {
      if (isForgotPassword) {
        const res = await fetch("http://localhost:5005/api/auth/forgotpassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        alert(`Password reset link sent! Check server console (Simulated Email):\n${data.resetUrl}`);
        setIsForgotPassword(false);
        setLoading(false);
        return;
      }

      let res;
      if (isRegister) {
        res = await register(name, email, password, dob);
      } else {
        res = await login(email, password);
      }

      if (!res.success) {
        throw new Error(res.error);
      }
    } catch (err) {
      console.error("Auth error:", err);
      alert(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-[#020205] transition-colors duration-700 relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute h-[500px] w-[500px] -top-48 -left-48 bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute h-[600px] w-[600px] -bottom-48 -right-48 bg-purple-500/10 dark:bg-purple-600/5 blur-[150px] rounded-full animate-pulse delay-700" />
        
        {/* Particle Overlay */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              y: [-20, 20, -20],
              x: [-10, 10, -10]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-indigo-400 dark:bg-indigo-500 rounded-full"
            style={{ left: p.left, top: p.top }}
          />
        ))}
      </div>

      <Background3D />

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full max-w-[460px] bg-white/70 dark:bg-[#0a0a0f]/80 backdrop-blur-3xl rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)] p-8 sm:p-12 border border-white/40 dark:border-white/5 relative z-10 overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[60px] pointer-events-none" />
        
        <div className="flex flex-col items-center mb-12 text-center relative">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 p-[2px] rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] mb-8 group"
          >
            <div className="w-full h-full bg-white dark:bg-[#07070a] rounded-[22px] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Cpu size={32} className="text-indigo-600 dark:text-indigo-400 drop-shadow-sm" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3 italic">
              Kynara<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-bold uppercase tracking-[0.2em] opacity-60">
              {isForgotPassword ? "Neural Recovery" : isRegister ? "Initialize Sequence" : "AESTHETIC INTELLIGENCE"}
            </p>
          </motion.div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-5">
          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative group"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                   <User className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Identify Yourself (Full Name)"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
              <Mail className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            </div>
            <input
              type="email"
              required
              className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Communication Channel (Email)"
            />
          </div>

          {!isForgotPassword && (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                <Lock className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              </div>
              <input
                type="password"
                required
                className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure Access Code (Password)"
              />
            </div>
          )}

          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative group"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                  <Calendar className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                </div>
                <input
                  type="date"
                  required
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isForgotPassword ? "Execute Recovery" : isRegister ? "Initiate Core" : "Commence Session"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center space-y-5">
          {!isForgotPassword && !isRegister && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
            >
              Lost Access Code?
            </button>
          )}

          <div className="flex flex-col items-center gap-4">
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase opacity-40">
              {isForgotPassword ? "System Re-Entry?" : isRegister ? "Node Existing?" : "New Intelligence Entry?"}
            </p>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setIsForgotPassword(false);
              }}
              className="px-8 py-2.5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all active:scale-95"
            >
              {isForgotPassword ? "Return to Uplink" : isRegister ? "Commence Login" : "Initialize Registration"}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between opacity-40 group/footer">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Secure Protocol v2.0</span>
          </div>
          <div className="flex gap-4">
            <Globe size={14} className="hover:text-indigo-500 transition-colors pointer-events-auto cursor-pointer" />
            <Sparkles size={14} className="hover:text-indigo-500 transition-colors pointer-events-auto cursor-pointer" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
