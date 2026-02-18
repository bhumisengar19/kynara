import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

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
            const res = await axios.post("http://localhost:5000/api/auth/login", {
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
            const res = await axios.post("http://localhost:5000/api/auth/register", {
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
        delete axios.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
