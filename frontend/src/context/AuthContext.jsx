import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (token && storedUser && storedUser !== "undefined") {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user from local storage", e);
            localStorage.removeItem("user");
        } finally {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });
            const { token, user } = res.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (err) {
            console.error("Login failed", err);
            return { success: false, error: err.response?.data?.message || "Login failed" };
        }
    };

    const register = async (name, email, password, dob) => {
        try {
            const res = await api.post("/auth/register", {
                name,
                email,
                password,
                dob,
            });
            const { token, user } = res.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (err) {
            console.error("Registration failed", err);
            return { success: false, error: err.response?.data?.message || "Registration failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {loading ? (
                <div className="flex h-screen w-screen items-center justify-center bg-[#0F0B1F] text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-purple-500"></div>
                        <p className="animate-pulse text-sm font-medium text-white/60">Initializing Kynara...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
