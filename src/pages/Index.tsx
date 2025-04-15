
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isLoggedIn } = useAuth();

  // Redirect to Dashboard if logged in, otherwise to Login page
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
