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
    <div className="h-screen w-full flex items-center justify-center p-4 bg-kynaraLight-bg dark:bg-[#0a0a0b] transition-colors duration-500 relative overflow-hidden">
      <Background3D />

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-white/60 dark:bg-[#101014]/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-black/[0.05] dark:border-white/[0.05] relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] rounded-2xl shadow-lg mb-6"
          >
            <div className="w-full h-full bg-white dark:bg-[#151517] rounded-[15px] flex items-center justify-center">
              <img src="/logo.png" alt="Kynara Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            </div>
          </motion.div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Welcome to Kynara
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {isForgotPassword ? "Enter your email to reset password" : isRegister ? "Create your account to get started" : "Log in to continue your journey"}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-4">
          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="relative group"
              >
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="email"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />
          </div>

          {!isForgotPassword && (
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          )}

          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="relative group"
              >
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="date"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isForgotPassword ? "Send Link" : isRegister ? "Create Account" : "Log In"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {!isForgotPassword && !isRegister && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
            >
              Forgot password?
            </button>
          )}

          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
            <span>{isForgotPassword ? "Remembered your password?" : isRegister ? "Already have an account?" : "Don't have an account?"}</span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setIsForgotPassword(false);
              }}
              className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
            >
              {isForgotPassword ? "Log In" : isRegister ? "Log In" : "Sign Up"}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-1.5 opacity-50">
          <ShieldCheck size={14} className="text-gray-400" />
          <span className="text-[11px] font-medium tracking-wide text-gray-400">Secured Configuration</span>
        </div>
      </motion.div>
    </div>
  );
}
