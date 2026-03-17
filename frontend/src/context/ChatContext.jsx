import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { token } = useAuth();
    const [chats, setChats] = useState([]);
    const [archivedChats, setArchivedChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    // Fetch Logic
    const fetchChats = async () => {
        if (!token) return;
        try {
            const res = await api.get("/chat/all");
            setChats(res.data);
        } catch (err) {
            console.error("Failed to fetch chats", err);
        }
    };

    const fetchArchivedChats = async () => {
        if (!token) return;
        try {
            const res = await api.get("/chat/archived");
            setArchivedChats(res.data);
        } catch (err) {
            console.error("Failed to fetch archived chats", err);
        }
    };

    // Initial Fetch
    useEffect(() => {
        if (token) {
            fetchChats();
            if (showArchived) fetchArchivedChats();
        }
    }, [token, showArchived]);

    // Actions
    const createChat = async () => {
        try {
            console.log("Attempting to create new chat...");
            
            const hour = new Date().getHours();
            let greeting = "Good Morning";
            if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
            else if (hour >= 17 && hour < 21) greeting = "Good Evening";
            else if (hour >= 21 || hour < 5) greeting = "Good Night";

            const res = await api.post("/chat/new", { greeting });
            console.log("Create Chat Success:", res.data);
            const newChat = res.data;
            setChats((prev) => [newChat, ...prev]);
            setCurrentChatId(newChat._id);
            setShowArchived(false);
            return newChat._id;
        } catch (err) {
            console.error("Create Chat Failed!", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });
            // Fallback for UI if it's a network error
            if (!err.response) {
                alert("Network error: Please check if the backend server is running on port 5005.");
            } else if (err.response.status === 401) {
                alert("Session expired. Please log in again.");
            }
            return null;
        }
    };

    const archiveChat = async (chatId) => {
        try {
            await api.put(`/chat/archive/${chatId}`);
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            if (currentChatId === chatId) setCurrentChatId(null);
        } catch (err) {
            console.error("Archive Failed", err);
        }
    };

    const unarchiveChat = async (chatId) => {
        try {
            await api.put(`/chat/unarchive/${chatId}`);
            setArchivedChats((prev) => prev.filter((c) => c._id !== chatId));
            fetchChats(); // Refresh
        } catch (err) {
            console.error("Unarchive Failed", err);
        }
    };

    const deleteChat = async (chatId) => {
        try {
            await api.delete(`/chat/${chatId}`);
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            setArchivedChats((prev) => prev.filter((c) => c._id !== chatId));
            if (currentChatId === chatId) setCurrentChatId(null);
        } catch (err) {
            console.error("Delete Failed", err);
        }
    };

    const renameChat = async (chatId, newTitle) => {
        try {
            const res = await api.put(`/chat/rename/${chatId}`, { title: newTitle });
            // Use newTitle explicitly in case backend returns Old document despite {new: true}
            setChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c)));
            setArchivedChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c)));
        } catch (err) {
            console.error("Rename Failed", err);
            alert("Failed to rename chat: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <ChatContext.Provider
            value={{
                chats,
                archivedChats,
                showArchived,
                setShowArchived,
                createChat,
                archiveChat,
                unarchiveChat,
                renameChat,
                deleteChat,
                currentChatId,
                setCurrentChatId,
                fetchChats,
                setChats, // Exposed for external updates (e.g. title update)
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
