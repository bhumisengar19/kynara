import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import Background3D from "./components/Background3D";

import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import { SidebarDemo } from "./components/SidebarDemo";
import NightSkyBackground from "./components/NightSkyBackground";
import BotanicalBackground from "./components/BotanicalBackground";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) return <div className="h-screen flex items-center justify-center bg-kynaraDark-bg text-white font-rounded">Loading...</div>;

  if (!user) {
    return <Login />;
  }

  return (
    <div className={`h-screen flex font-rounded overflow-hidden transition-colors duration-500 relative ${theme === 'dark' ? 'bg-kynaraDark-bg text-kynaraDark-text' : 'bg-kynaraLight-bg text-kynaraLight-text'}`}>
      {theme === 'dark' ? <NightSkyBackground /> : <BotanicalBackground />}
      <Sidebar />
      <div className="flex-1 flex overflow-hidden relative h-full">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/c/:id" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sidebar-demo" element={<div className="flex-1 flex items-center justify-center p-8 bg-black/20"><SidebarDemo /></div>} />
        </Routes>
      </div>
    </div>
  );
}
