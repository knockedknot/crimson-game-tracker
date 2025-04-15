
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Calendar, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  id: string;
  username: string;
  created_at: string;
}

interface UserStats {
  totalGames: number;
  totalPlaytime: number;
  totalAchievements: number;
}

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("Passionate gamer with a love for RPGs and strategy games.");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalGames: 0,
    totalPlaytime: 0,
    totalAchievements: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProfileData(data);
          setUsername(data.username);
        }
        
        // Fetch user stats
        const [gamesResponse, achievementsResponse] = await Promise.all([
          supabase
            .from('user_games')
            .select('hours_played')
            .eq('user_id', user.id),
          supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', user.id)
        ]);
        
        if (gamesResponse.error) throw gamesResponse.error;
        if (achievementsResponse.error) throw achievementsResponse.error;
        
        const totalGames = gamesResponse.data.length;
        const totalPlaytime = gamesResponse.data.reduce((acc, game) => acc + Number(game.hours_played), 0);
        const totalAchievements = achievementsResponse.data.length;
        
        setUserStats({
          totalGames,
          totalPlaytime,
          totalAchievements
        });
        
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
      if (profileData) {
        setProfileData({
          ...profileData,
          username
        });
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading profile...</p>
      </div>
    );
  }
  
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
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Joined {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Recently'}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Games</span>
                <span className="font-medium">{userStats.totalGames}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Playtime</span>
                <span className="font-medium">{userStats.totalPlaytime}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Achievements</span>
                <span className="font-medium">{userStats.totalAchievements}</span>
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
                      if (profileData) setUsername(profileData.username);
                      setBio("Passionate gamer with a love for RPGs and strategy games.");
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
