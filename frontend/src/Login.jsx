import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./context/AuthContext";
import Background3D from "./components/Background3D";
import { User, Mail, Lock, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="h-screen w-full flex items-center justify-center p-4 bg-light-bg dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
      <Background3D />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 lg:p-10 border border-white/20 dark:border-white/5 relative z-10 overflow-visible"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-20 h-20 bg-gradient-to-br from-accent-purple to-accent-cyan p-1 rounded-3xl shadow-lg mb-6"
          >
            <div className="w-full h-full bg-white dark:bg-dark-secondary rounded-[1.4rem] flex items-center justify-center overflow-hidden p-2">
              <img src="/logo.png" alt="Kynara Logo" className="w-full h-full object-contain" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black text-light-text dark:text-dark-text tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan">
            Kynara OS
          </h1>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mt-2 text-sm font-bold tracking-widest uppercase opacity-40">
            {isForgotPassword ? "Recovery Protocol" : isRegister ? "Initialize Identity" : "Neural Authentication"}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-5">
          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative group"
              >
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-purple/50 group-focus-within:text-accent-purple transition-colors" size={18} />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-light-section dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition-all text-light-text dark:text-dark-text font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Official Name"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-purple/50 group-focus-within:text-accent-purple transition-colors" size={18} />
            <input
              type="email"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-light-section dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition-all text-light-text dark:text-dark-text font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Neural Node Address"
            />
          </div>

          {!isForgotPassword && (
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-purple/50 group-focus-within:text-accent-purple transition-colors" size={18} />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-light-section dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-accent-purple transition-all text-light-text dark:text-dark-text font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Keyword"
              />
            </div>
          )}

          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative group"
              >
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-purple/50 group-focus-within:text-accent-purple transition-colors" size={18} />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-light-section dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-purple transition-all text-light-text dark:text-dark-text font-medium"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-accent-purple to-accent-deepPurple text-white font-black rounded-2xl shadow-xl shadow-accent-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isForgotPassword ? "Send Recovery Link" : isRegister ? "Create Identity" : "Authorize Access"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {!isForgotPassword && !isRegister && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-xs font-bold text-accent-purple hover:underline uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              Protocol: Reset Forgotten Key
            </button>
          )}

          <div className="text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary flex items-center justify-center gap-2">
            <span className="opacity-60">{isForgotPassword ? "Ready to re-auth?" : isRegister ? "Neural link exists?" : "New specimen?"}</span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setIsForgotPassword(false);
              }}
              className="text-accent-purple font-black hover:underline bg-transparent border-none p-0 cursor-pointer uppercase tracking-tighter"
            >
              {isForgotPassword ? "Abort Backup" : isRegister ? "Standard Login" : "Initialize Link"}
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-center gap-2 opacity-20 group cursor-default">
          <ShieldCheck size={14} className="group-hover:text-accent-purple" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Security Level 7 Active</span>
        </div>
      </motion.div>
    </div>
  );
}
