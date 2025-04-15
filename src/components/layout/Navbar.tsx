
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Library, 
  Trophy, 
  User, 
  LogOut 
} from "lucide-react";

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isLoggedIn, onLogout }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // You would add Supabase logout logic here
    navigate("/login");
  };

  return (
    <header className="w-full border-b border-gray-800 bg-playtrack-black">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-crimson font-bold text-xl">
          PlayTrack
        </Link>
        
        {isLoggedIn ? (
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link 
              to="/library" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </Link>
            <Link 
              to="/achievements" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-300 hover:text-white flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </nav>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-crimson hover:bg-crimson-dark" size="sm">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
