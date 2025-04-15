
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled in the login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg border border-gray-800 shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-crimson">PlayTrack</h1>
        <p className="text-gray-400 mt-2">Sign in to your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password" 
              className="text-xs text-crimson hover:text-crimson-light"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-crimson hover:bg-crimson-dark"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-400">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            className="text-crimson hover:text-crimson-light font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
