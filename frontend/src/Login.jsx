
import { useState } from "react";
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./context/AuthContext";

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
    // Basic validation
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
        // Keeps fetch/axios for forgot password? Or add to context?
        // Context didn't have forgot password. I'll keep explicit axios/fetch here for now or add to context.
        // Let's use axios directly here or fetch.
        // Since I added axios, use axios.
        // But context manages token. Forgot password doesn't need token.
        // I'll keep previous fetch logic for forgot password but updated URL.
        const res = await fetch("http://localhost:5000/api/auth/forgotpassword", {
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
      // Success handled by context (setUser -> App re-renders)

    } catch (err) {
      console.error("Auth error:", err);
      alert(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background is handled by body class in index.css */}

      <div className="glass-card w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-accent-purple/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent-cyan/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Kynara Logo" className="w-24 h-24 object-contain mb-4 hover:rotate-12 transition-transform duration-500 drop-shadow-2xl animate-float" />
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan tracking-tighter">
            KYNARA
          </h1>
        </div>

        <h2 className="text-xl mb-6 text-center font-medium opacity-70">
          {isForgotPassword
            ? "Reset Password"
            : isRegister ? "Create Account" : "Access your workspace"}
        </h2>

        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            className="input-glass mb-4 text-inherit placeholder-opacity-70"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="input-glass mb-4 text-inherit placeholder-opacity-70"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isForgotPassword && (
          <input
            type="password"
            placeholder="Password"
            className="input-glass mb-4 text-inherit placeholder-opacity-70"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {isRegister && (
          <div className="mb-6">
            <label className="text-sm block mb-2 opacity-80 font-medium ml-1">Birthday (Optional)</label>
            <input
              type="date"
              className="input-glass text-inherit"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading
            ? "Processing..."
            : isForgotPassword
              ? "Send Reset Link"
              : isRegister
                ? "Register"
                : "Login"}
        </button>

        {!isForgotPassword && !isRegister && (
          <p
            onClick={() => setIsForgotPassword(true)}
            className="mt-4 text-center text-sm opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
          >
            Forgot Password?
          </p>
        )}

        <p
          onClick={() => {
            setIsRegister(!isRegister);
            setIsForgotPassword(false);
          }}
          className="mt-6 text-center text-sm cursor-pointer opacity-80 hover:opacity-100 transition-opacity font-medium"
        >
          {isForgotPassword
            ? "Back to Login"
            : isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}
