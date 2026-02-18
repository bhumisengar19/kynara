import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./Login";
import Sidebar from "./components/Sidebar";

/* Pages */
import ChatPage from "./pages/ChatPage";
import ProjectsPage from "./pages/ProjectsPage";
import AppsPage from "./pages/AppsPage";
import ImagesPage from "./pages/ImagesPage";
import CodexPage from "./pages/CodexPage";
import GPTsPage from "./pages/GPTsPage";
import ProfilePage from "./pages/ProfilePage";
import AppLoader from "./pages/AppLoader";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0F0B1F] text-white">Loading...</div>;

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen flex font-sans overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex overflow-hidden relative">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/c/:id" element={<ChatPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/apps/:appRoute" element={<AppLoader />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/codex" element={<CodexPage />} />
          <Route path="/gpts" element={<GPTsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
}
