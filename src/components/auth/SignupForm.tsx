
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(email, password, username);
      navigate("/login");
    } catch (error) {
      // Error is already handled in the signup function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg border border-gray-800 shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-crimson">PlayTrack</h1>
        <p className="text-gray-400 mt-2">Create your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="gamertag"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <p className="text-xs text-gray-400">Must be at least 6 characters</p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-crimson hover:bg-crimson-dark"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-crimson hover:text-crimson-light font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
