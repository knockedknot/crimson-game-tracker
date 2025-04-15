
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Calendar, Trophy } from "lucide-react";

// Mock user data
const mockUser = {
  username: "GamerPro123",
  email: "gamer@example.com",
  joined: "January 2023",
  bio: "Passionate gamer with a love for RPGs and strategy games.",
  achievements: 148,
  totalGames: 24,
  totalPlaytime: "328h"
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(mockUser.username);
  const [bio, setBio] = useState(mockUser.bio);
  const { toast } = useToast();
  
  const handleSaveProfile = () => {
    // This would be replaced with Supabase update logic
    console.log("Updating profile:", { username, bio });
    
    // Mock successful update
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully."
    });
    
    setIsEditing(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <div className="bg-card rounded-lg border border-gray-800 p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-crimson/20 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-crimson" />
              </div>
              <h2 className="text-xl font-bold">{username}</h2>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <Mail className="w-4 h-4 mr-1" />
                <span>{mockUser.email}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Joined {mockUser.joined}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Games</span>
                <span className="font-medium">{mockUser.totalGames}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Playtime</span>
                <span className="font-medium">{mockUser.totalPlaytime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Achievements</span>
                <span className="font-medium">{mockUser.achievements}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile details/edit */}
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Profile Details</h2>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setUsername(mockUser.username);
                      setBio(mockUser.bio);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    className="bg-crimson hover:bg-crimson-dark"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Bio</h3>
                  <p>{bio}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Achievements</h3>
                  <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                    <div className="w-10 h-10 bg-crimson/20 rounded-full flex items-center justify-center mr-4">
                      <Trophy className="w-5 h-5 text-crimson" />
                    </div>
                    <div>
                      <h4 className="font-medium">Master Tactician</h4>
                      <p className="text-sm text-gray-400">
                        Win a battle without taking any damage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
