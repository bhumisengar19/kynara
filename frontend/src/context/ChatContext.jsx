import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
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
            const res = await axios.get("http://localhost:5000/api/chat/all");
            setChats(res.data);
        } catch (err) {
            console.error("Failed to fetch chats", err);
        }
    };

    const fetchArchivedChats = async () => {
        if (!token) return;
        try {
            const res = await axios.get("http://localhost:5000/api/chat/archived");
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
            const res = await axios.post("http://localhost:5000/api/chat/new");
            const newChat = res.data;
            setChats((prev) => [newChat, ...prev]);
            setCurrentChatId(newChat._id);
            setShowArchived(false);
            return newChat._id;
        } catch (err) {
            console.error("Create Chat Failed", err);
            return null;
        }
    };

    const archiveChat = async (chatId) => {
        try {
            await axios.put(`http://localhost:5000/api/chat/archive/${chatId}`);
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            if (currentChatId === chatId) setCurrentChatId(null);
        } catch (err) {
            console.error("Archive Failed", err);
        }
    };

    const unarchiveChat = async (chatId) => {
        try {
            await axios.put(`http://localhost:5000/api/chat/unarchive/${chatId}`);
            setArchivedChats((prev) => prev.filter((c) => c._id !== chatId));
            fetchChats(); // Refresh
        } catch (err) {
            console.error("Unarchive Failed", err);
        }
    };

    const deleteChat = async (chatId) => {
        try {
            await axios.delete(`http://localhost:5000/api/chat/${chatId}`);
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            setArchivedChats((prev) => prev.filter((c) => c._id !== chatId));
            if (currentChatId === chatId) setCurrentChatId(null);
        } catch (err) {
            console.error("Delete Failed", err);
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
