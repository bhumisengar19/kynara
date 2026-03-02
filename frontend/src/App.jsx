import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import Background3D from "./components/Background3D";

/* Pages */
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import { SidebarDemo } from "./components/SidebarDemo";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0F0B1F] text-white">Loading...</div>;

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen flex font-sans overflow-hidden bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300 relative">
      <Background3D />
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
