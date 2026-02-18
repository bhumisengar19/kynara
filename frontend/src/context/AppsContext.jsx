import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const AppsContext = createContext();

export const useAppsContext = () => useContext(AppsContext);

export const AppsProvider = ({ children }) => {
    const { user } = useAuth();
    const [apps, setApps] = useState([]); // All available apps
    const [installedApps, setInstalledApps] = useState([]); // User's installed apps
    const [loading, setLoading] = useState(false);

    // Fetch All Apps
    const fetchApps = async (search = "", category = "") => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/apps?search=${search}&category=${category}`);
            setApps(res.data);
        } catch (err) {
            console.error("Failed to fetch apps", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Installed Apps
    const fetchInstalledApps = async () => {
        if (!user) return;
        try {
            const res = await axios.get("http://localhost:5000/api/apps/installed");
            setInstalledApps(res.data);
        } catch (err) {
            console.error("Failed to fetch installed apps", err);
        }
    };

    // Install App
    const installApp = async (appId) => {
        try {
            const res = await axios.post("http://localhost:5000/api/apps/install", { appId });
            await fetchInstalledApps(); // Refresh installed list
            return true;
        } catch (err) {
            console.error("Failed to install app", err);
            return false;
        }
    };

    // Uninstall App
    const uninstallApp = async (appId) => {
        try {
            await axios.delete(`http://localhost:5000/api/apps/uninstall/${appId}`);
            setInstalledApps(prev => prev.filter(app => app._id !== appId));
            return true;
        } catch (err) {
            console.error("Failed to uninstall app", err);
            return false;
        }
    };

    // Toggle App
    const toggleApp = async (appId) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/apps/toggle/${appId}`);
            setInstalledApps(prev => prev.map(app =>
                app._id === appId ? { ...app, isEnabled: res.data.isEnabled } : app
            ));
        } catch (err) {
            console.error("Failed to toggle app", err);
        }
    };

    // Initial Load
    useEffect(() => {
        if (user) {
            fetchApps();
            fetchInstalledApps();
        }
    }, [user]);

    return (
        <AppsContext.Provider value={{
            apps,
            installedApps,
            loading,
            fetchApps,
            fetchInstalledApps,
            installApp,
            uninstallApp,
            toggleApp
        }}>
            {children}
        </AppsContext.Provider>
    );
};
