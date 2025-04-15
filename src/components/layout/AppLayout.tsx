
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";

const AppLayout = () => {
  const { isLoggedIn, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-playtrack-black flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
