
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Clock, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GameDialog from "@/components/games/GameDialog";
import GameProgressDialog from "@/components/games/GameProgressDialog";

// Type definition for game data
interface Game {
  id: string;
  userGameId: string;
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

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [editGameData, setEditGameData] = useState<Game | null>(null);
  const [progressGameData, setProgressGameData] = useState<Game | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user's games from Supabase
  const fetchUserGames = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Query user_games joined with games table to get game details
      const { data: userGames, error } = await supabase
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
        .eq('user_id', user.id);
      
      if (error) throw error;

      // Fetch achievements counts for each game
      const gameIds = userGames?.map(game => game.games.id) || [];
      
      // Get total achievements per game using a more robust method
      let achievementCounts: { game_id: string, count: number }[] = [];
      if (gameIds.length > 0) {
        const { data, error: achievementError } = await supabase
          .from('achievements')
          .select('game_id')
          .in('game_id', gameIds);
          
        if (achievementError) throw achievementError;
        
        // Count achievements by game_id in JavaScript
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
      
      // Transform data to match GameCard component props
      const transformedGames = userGames?.map(game => ({
        id: game.games.id,
        userGameId: game.id,
        title: game.games.title,
        cover: "https://images.unsplash.com/photo-1605899435973-ca2d1a8ee8e7?q=80&w=500&auto=format&fit=crop", // Placeholder
        platforms: game.games.platform ? [game.games.platform] : ["Unknown"],
        genres: game.games.genre ? [game.games.genre] : ["Unknown"],
        hoursPlayed: Number(game.hours_played),
        achievements: {
          earned: earnedByGame[game.games.id] || 0,
          total: achievementCounts.find(a => a.game_id === game.games.id)?.count || 0
        },
        lastPlayed: game.last_played ? new Date(game.last_played).toLocaleDateString() : null
      })) || [];
      
      setGames(transformedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Failed to load your games.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserGames();
  }, [user]);
  
  // Filter games based on search term
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.platforms.some(platform => platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
    game.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle game edit
  const handleEditGame = (game: Game) => {
    setEditGameData(game);
  };
  
  // Handle game progress update
  const handleUpdateProgress = (game: Game) => {
    setProgressGameData(game);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Game Library</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search games..."
              className="pl-10 bg-gray-800 border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddGameOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Game
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Loading your games...</p>
        </div>
      ) : (
        <>
          {games.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">You haven't added any games to your library yet.</p>
              <p className="text-gray-400 mt-2">Click the "Add Game" button to get started.</p>
              <Button onClick={() => setAddGameOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Game
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGames.map(game => (
                <Card key={game.id} className="overflow-hidden flex flex-col">
                  <div className="relative">
                    <img 
                      src={game.cover} 
                      alt={`${game.title} cover`} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 p-4">
                      <h3 className="text-white font-semibold text-lg">{game.title}</h3>
                      <div className="flex mt-1 mb-2">
                        {game.platforms.map((platform, i) => (
                          <span key={`${game.id}-platform-${i}`} className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded mr-1">{platform}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{game.hoursPlayed}h</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Trophy className="w-4 h-4 mr-1" />
                          <span>{game.achievements.earned}/{game.achievements.total}</span>
                        </div>
                      </div>
                      {game.lastPlayed && (
                        <div className="text-xs text-gray-400 mt-2">
                          Last played: {game.lastPlayed}
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditGame(game)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateProgress(game)}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Update Progress
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {filteredGames.length === 0 && (
                <div className="text-center py-16 col-span-full">
                  <p className="text-gray-400">No games found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Add Game Dialog */}
      <GameDialog 
        open={addGameOpen}
        onOpenChange={setAddGameOpen}
        onSuccess={fetchUserGames}
      />
      
      {/* Edit Game Dialog */}
      {editGameData && (
        <GameDialog 
          open={!!editGameData}
          onOpenChange={() => setEditGameData(null)}
          game={{
            id: editGameData.id,
            title: editGameData.title,
            platform: editGameData.platforms[0],
            genre: editGameData.genres[0],
          }}
          onSuccess={fetchUserGames}
        />
      )}
      
      {/* Game Progress Dialog */}
      {progressGameData && (
        <GameProgressDialog
          open={!!progressGameData}
          onOpenChange={() => setProgressGameData(null)}
          gameData={{
            id: progressGameData.id,
            title: progressGameData.title,
            userGameId: progressGameData.userGameId,
            hoursPlayed: progressGameData.hoursPlayed,
          }}
          onSuccess={fetchUserGames}
        />
      )}
    </div>
  );
};

export default Library;
