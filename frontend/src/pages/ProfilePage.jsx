import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserProfile from "../components/UserProfile";

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return <UserProfile user={user} onBack={() => navigate('/')} />;
}
