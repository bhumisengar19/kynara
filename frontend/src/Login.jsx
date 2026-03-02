import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./context/AuthContext";
import Background3D from "./components/Background3D";
import { User, Mail, Lock, Calendar, ArrowRight, ShieldCheck, MessageSquare } from "lucide-react";

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
    <div className="h-screen w-full flex items-center justify-center p-4 bg-light-bg dark:bg-dark-bg transition-colors duration-500 relative overflow-hidden">
      <Background3D />

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md bg-white dark:bg-dark-secondary rounded-[48px] shadow-[0_40px_100px_rgba(168,85,247,0.1)] p-10 lg:p-12 border border-purple-100 dark:border-white/5 relative z-10 overflow-visible"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 bg-purple-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-purple-500/20 mb-8 overflow-hidden"
          >
            <MessageSquare size={48} className="text-white" />
          </motion.div>
          <h1 className="text-5xl font-display font-black text-light-text dark:text-dark-text tracking-tighter mb-4">
            Kynara
          </h1>
          <p className="text-light-textSecondary dark:text-dark-textSecondary text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
            {isForgotPassword ? "Neural Recovery" : isRegister ? "Create Identity" : "Auth Protocol"}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-6">
          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative group"
              >
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-300 transition-colors group-focus-within:text-purple-500" size={18} />
                <input
                  type="text"
                  className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-purple-50/50 dark:bg-white/5 border border-purple-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all text-light-text dark:text-dark-text font-bold text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-300 transition-colors group-focus-within:text-purple-500" size={18} />
            <input
              type="email"
              className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-purple-50/50 dark:bg-white/5 border border-purple-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all text-light-text dark:text-dark-text font-bold text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />
          </div>

          {!isForgotPassword && (
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-300 transition-colors group-focus-within:text-purple-500" size={18} />
              <input
                type="password"
                className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-purple-50/50 dark:bg-white/5 border border-purple-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all text-light-text dark:text-dark-text font-bold text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-4 bg-purple-500 text-white font-black rounded-[24px] shadow-2xl shadow-purple-500/30 transition-all hover:bg-purple-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isForgotPassword ? "Reset" : isRegister ? "Create account" : "Sign In"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center space-y-6">
          {!isForgotPassword && !isRegister && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-[10px] font-black text-purple-400 hover:text-purple-600 uppercase tracking-widest transition-colors"
            >
              Forgot Password?
            </button>
          )}

          <div className="text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary flex items-center justify-center gap-2">
            <span className="opacity-40">{isForgotPassword ? "Ready?" : isRegister ? "Have an account?" : "New here?"}</span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setIsForgotPassword(false);
              }}
              className="text-purple-500 font-black hover:underline uppercase tracking-widest"
            >
              {isForgotPassword ? "Back to Login" : isRegister ? "Sign In" : "Register"}
            </button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-purple-100 dark:border-white/5 flex items-center justify-center gap-3 opacity-30 group cursor-default">
          <ShieldCheck size={16} className="text-purple-500" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">E2EE Secured</span>
        </div>
      </motion.div>
    </div>
  );
}
