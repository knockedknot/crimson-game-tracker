
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Gamepad2, 
  Clock, 
  Trophy, 
  Calendar, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import GameCard from "@/components/dashboard/GameCard";
import AchievementCard from "@/components/dashboard/AchievementCard";
import GameDialog from "@/components/games/GameDialog";
import AchievementDialog from "@/components/games/AchievementDialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types for our data
interface Game {
  id: string;
  title: string;
  cover: string;
  platforms: string[];
  genres: string[];
  hoursPlayed: number;
  achievements: {
    earned: number;
    total: number;
  };
  lastPlayed: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra Rare";
  game: string;
  game_id: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalPlaytime: 0,
    totalAchievements: 0,
    activeStreak: 0
  });
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [addAchievementOpen, setAddAchievementOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch recent games
        const { data: userGames, error: gamesError } = await supabase
          .from('user_games')
          .select(`
            id,
            hours_played,
            last_played,
            games:game_id(
              id,
              title,
              platform,
              genre
            )
          `)
          .eq('user_id', user.id)
          .order('last_played', { ascending: false })
          .limit(2);
        
        if (gamesError) throw gamesError;
        
        // Fetch achievements counts for each game
        const gameIds = userGames?.map(game => game.games.id) || [];
        
        // Get total achievements per game
        const { data: achievementCounts, error: achievementError } = await supabase
          .from('achievements')
          .select('game_id, count')
          .in('game_id', gameIds)
          .group('game_id');
          
        if (achievementError && gameIds.length > 0) throw achievementError;
        
        // Get earned achievements per game for this user
        const { data: earnedAchievements, error: earnedError } = await supabase
          .from('user_achievements')
          .select(`
            achievements:achievement_id (
              game_id
            )
          `)
          .eq('user_id', user.id);
          
        if (earnedError) throw earnedError;
        
        // Count earned achievements by game
        const earnedByGame: Record<string, number> = {};
        earnedAchievements?.forEach(item => {
          const gameId = item.achievements.game_id;
          earnedByGame[gameId] = (earnedByGame[gameId] || 0) + 1;
        });
        
        // Transform games data
        const transformedGames = userGames?.map(game => ({
          id: game.games.id,
          title: game.games.title,
          cover: "https://images.unsplash.com/photo-1605899435973-ca2d1a8ee8e7?q=80&w=500&auto=format&fit=crop", // Placeholder
          platforms: game.games.platform ? [game.games.platform] : ["Unknown"],
          genres: game.games.genre ? [game.games.genre] : ["Unknown"],
          hoursPlayed: Number(game.hours_played),
          achievements: {
            earned: earnedByGame[game.games.id] || 0,
            total: achievementCounts?.find(a => a.game_id === game.games.id)?.count || 0
          },
          lastPlayed: game.last_played ? new Date(game.last_played).toLocaleDateString() : null
        })) || [];
        
        setRecentGames(transformedGames);
        
        // Fetch recent achievements
        const { data: userAchievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select(`
            id,
            achieved_at,
            achievements:achievement_id(
              id,
              name,
              description,
              games:game_id(
                id,
                title
              )
            )
          `)
          .eq('user_id', user.id)
          .order('achieved_at', { ascending: false })
          .limit(3);
        
        if (achievementsError) throw achievementsError;
        
        // Transform achievements data
        const rarityLevels = ["Common", "Uncommon", "Rare", "Ultra Rare"] as const;
        const transformedAchievements = userAchievements?.map(achievement => ({
          id: achievement.id,
          name: achievement.achievements.name,
          description: achievement.achievements.description || "No description available",
          rarity: rarityLevels[Math.floor(Math.random() * rarityLevels.length)],
          game: achievement.achievements.games.title,
          game_id: achievement.achievements.games.id,
          date: new Date(achievement.achieved_at).toLocaleDateString()
        })) || [];
        
        setAchievements(transformedAchievements);
        
        // Calculate stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_games')
          .select('id, hours_played')
          .eq('user_id', user.id);
          
        if (statsError) throw statsError;
        
        const { data: achievementCount, error: countError } = await supabase
          .from('user_achievements')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);
          
        if (countError) throw countError;
        
        // Calculate active streak by checking if user has played in the last day
        let streak = 0;
        const { data: streakData, error: streakError } = await supabase
          .from('user_games')
          .select('last_played')
          .eq('user_id', user.id)
          .order('last_played', { ascending: false })
          .limit(1);
          
        if (!streakError && streakData && streakData.length > 0) {
          const lastPlayed = new Date(streakData[0].last_played);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastPlayed.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            streak = 1; // Simple streak implementation
          }
        }
        
        setStats({
          totalGames: statsData?.length || 0,
          totalPlaytime: statsData?.reduce((total, game) => total + Number(game.hours_played), 0) || 0,
          totalAchievements: achievementCount?.length || 0,
          activeStreak: streak
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const handleAddAchievement = (gameId: string) => {
    setSelectedGameId(gameId);
    setAddAchievementOpen(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // If we have no games, use mock data for display
  const displayGames = recentGames.length > 0 ? recentGames : [];
  const displayAchievements = achievements.length > 0 ? achievements : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleRefresh}>Refresh</Button>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Games"
          value={stats.totalGames.toString()}
          icon={<Gamepad2 />}
          subtitle="Across all platforms"
        />
        <StatCard 
          title="Total Playtime"
          value={`${stats.totalPlaytime}h`}
          icon={<Clock />}
          subtitle="All time"
        />
        <StatCard 
          title="Achievements"
          value={`${stats.totalAchievements}`}
          icon={<Trophy />}
          subtitle="Unlocked"
        />
        <StatCard 
          title="Active Streak"
          value={`${stats.activeStreak} days`}
          icon={<Calendar />}
          subtitle="Personal best: 0 days"
        />
      </div>
      
      {/* Recently played games */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recently Played</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAddGameOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Game
              </Button>
              <Button 
                size="sm" 
                asChild
              >
                <Link to="/library">View All</Link>
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">Your recently played games</p>
          
          {loading ? (
            <p className="text-gray-400">Loading your games...</p>
          ) : (
            <>
              {displayGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayGames.map(game => (
                    <GameCard 
                      key={game.id}
                      {...game}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-gray-800 p-6 text-center">
                  <p className="text-gray-400">You haven't added any games yet.</p>
                  <Button 
                    onClick={() => setAddGameOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Game
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Recent achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Achievements</h2>
            {displayGames.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddAchievement(displayGames[0].id)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Achievement
                </Button>
                <Button 
                  size="sm"
                  asChild
                >
                  <Link to="/achievements">View All</Link>
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-4">Your latest unlocks</p>
          
          {loading ? (
            <p className="text-gray-400">Loading your achievements...</p>
          ) : (
            <>
              {displayAchievements.length > 0 ? (
                <div className="space-y-4">
                  {displayAchievements.map(achievement => (
                    <AchievementCard 
                      key={achievement.id}
                      {...achievement}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-gray-800 p-6 text-center">
                  <p className="text-gray-400">No achievements unlocked yet.</p>
                  {displayGames.length > 0 && (
                    <Button 
                      onClick={() => handleAddAchievement(displayGames[0].id)}
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Achievement
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Add Game Dialog */}
      <GameDialog 
        open={addGameOpen}
        onOpenChange={setAddGameOpen}
        onSuccess={handleRefresh}
      />
      
      {/* Add Achievement Dialog */}
      {selectedGameId && (
        <AchievementDialog 
          open={addAchievementOpen}
          onOpenChange={setAddAchievementOpen}
          gameId={selectedGameId}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default Dashboard;
