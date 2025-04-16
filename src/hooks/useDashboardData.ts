
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

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

interface DashboardStats {
  totalGames: number;
  totalPlaytime: number;
  totalAchievements: number;
  activeStreak: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    totalPlaytime: 0,
    totalAchievements: 0,
    activeStreak: 0
  });

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
      
      // Get total achievements per game - Fixed groupBy query
      let achievementCounts = [];
      if (gameIds.length > 0) {
        // This approach avoids using the .group() method that caused the error
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .in('game_id', gameIds);
          
        if (error) throw error;
        
        // Do the counting in JavaScript instead of SQL
        const countByGameId: Record<string, number> = {};
        data?.forEach(achievement => {
          countByGameId[achievement.game_id] = (countByGameId[achievement.game_id] || 0) + 1;
        });
        
        achievementCounts = Object.entries(countByGameId).map(([game_id, count]) => ({
          game_id,
          count
        }));
      }
      
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
      
      const { count: achievementCount, error: countError } = await supabase
        .from('user_achievements')
        .select('id', { count: 'exact', head: true })
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
        totalAchievements: achievementCount || 0,
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

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return {
    loading,
    recentGames,
    achievements,
    stats,
    refreshData: fetchDashboardData
  };
};
