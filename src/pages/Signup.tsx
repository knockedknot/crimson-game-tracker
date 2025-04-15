
import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  // This is a mock function that would be replaced with Supabase authentication
  const handleSignup = async (email: string, password: string, username: string) => {
    // For now, we just mock a successful signup after a delay
    return new Promise<void>((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // This would be where you connect to Supabase auth
        console.log("Signing up with:", { email, password, username });
        
        // Mock success
        resolve();
      }, 1000);
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-playtrack-black">
      <SignupForm onSignup={handleSignup} />
    </div>
  );
};

export default Signup;
