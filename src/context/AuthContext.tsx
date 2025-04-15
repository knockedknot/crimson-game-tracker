
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in on component mount
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // In a real app, this would connect to Supabase authentication
  const login = async (email: string, password: string) => {
    // This is a mock implementation
    // In a real app, you'd use Supabase auth.signIn()
    console.log("Logging in with:", { email, password });
    
    return new Promise<void>((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // Mock successful login
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    // In a real app, you'd use Supabase auth.signOut()
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
    navigate("/login");
  };

  const signup = async (email: string, password: string, username: string) => {
    // This is a mock implementation
    // In a real app, you'd use Supabase auth.signUp()
    console.log("Signing up with:", { email, password, username });
    
    return new Promise<void>((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // Mock successful signup
        resolve();
      }, 1000);
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
