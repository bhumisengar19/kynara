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
            const isValidToken = token && token !== "undefined" && token !== "null";
            const isValidUser = storedUser && storedUser !== "undefined" && storedUser !== "null";

            if (isValidToken && isValidUser) {
                setUser(JSON.parse(storedUser));
            } else {
                // Clear any junk
                if (!isValidToken || !isValidUser) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                    setToken(null);
                }
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

    const updateProfile = async (formData) => {
        try {
            const res = await api.put("/auth/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const updatedUser = res.data.user;
            
            // Sync with local state + local storage
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            return { success: true, user: updatedUser };
        } catch (err) {
            console.error("Profile update failed", err);
            return { success: false, error: err.response?.data?.message || "Update profile failed" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading }}>
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
