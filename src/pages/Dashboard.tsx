
import { useState, useEffect } from "react";
import { 
  Gamepad2, 
  Clock, 
  Trophy, 
  Calendar 
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import GameCard from "@/components/dashboard/GameCard";
import AchievementCard from "@/components/dashboard/AchievementCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Types for our data
interface Game {
  id: number | string;
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
  id: number | string;
  name: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra Rare";
  game: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalPlaytime: 0,
    totalAchievements: 0,
    activeStreak: 0
  });

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
        
        // Transform games data
        const transformedGames = userGames?.map(game => ({
          id: game.id,
          title: game.games.title,
          cover: "https://images.unsplash.com/photo-1605899435973-ca2d1a8ee8e7?q=80&w=500&auto=format&fit=crop", // Placeholder
          platforms: game.games.platform ? [game.games.platform] : ["Unknown"],
          genres: game.games.genre ? [game.games.genre] : ["Unknown"],
          hoursPlayed: Number(game.hours_played),
          achievements: {
            earned: 0, // Placeholder until we fetch achievements
            total: 0  // Placeholder until we fetch achievements
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
        
        setStats({
          totalGames: statsData?.length || 0,
          totalPlaytime: statsData?.reduce((total, game) => total + Number(game.hours_played), 0) || 0,
          totalAchievements: achievementCount?.length || 0,
          activeStreak: 0 // Placeholder for streak calculation
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // If we have no games, use mock data for display
  const displayGames = recentGames.length > 0 ? recentGames : [];
  const displayAchievements = achievements.length > 0 ? achievements : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
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
            <button className="text-sm text-crimson hover:text-crimson-light">
              View All
            </button>
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
                  <p className="text-gray-400 mt-2">Add games to start tracking your progress!</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Recent achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Achievements</h2>
            <button className="text-sm text-crimson hover:text-crimson-light">
              View All
            </button>
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
                  <p className="text-gray-400 mt-2">Start playing to earn achievements!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
