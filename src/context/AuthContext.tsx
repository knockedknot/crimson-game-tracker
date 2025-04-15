
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoggedIn(!!currentSession);
        
        if (event === 'SIGNED_IN') {
          localStorage.setItem("isLoggedIn", "true");
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem("isLoggedIn");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoggedIn(!!currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, session, login, logout, signup }}>
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
