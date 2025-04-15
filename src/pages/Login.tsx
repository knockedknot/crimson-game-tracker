
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  const navigate = useNavigate();
  
  // This is a mock function that would be replaced with Supabase authentication
  const handleLogin = async (email: string, password: string) => {
    // For now, we just mock a successful login after a delay
    return new Promise<void>((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // This would be where you connect to Supabase auth
        console.log("Logging in with:", { email, password });
        
        // Mock success
        localStorage.setItem("isLoggedIn", "true");
        resolve();
      }, 1000);
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-playtrack-black">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default Login;
