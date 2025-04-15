
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import GameCard from "@/components/dashboard/GameCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Type definition for game data
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

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch user's games from Supabase
  useEffect(() => {
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
        
        // Transform data to match GameCard component props
        const transformedGames = userGames?.map(game => ({
          id: game.id,
          title: game.games.title,
          cover: "https://images.unsplash.com/photo-1605899435973-ca2d1a8ee8e7?q=80&w=500&auto=format&fit=crop", // Placeholder
          platforms: game.games.platform ? [game.games.platform] : ["Unknown"],
          genres: game.games.genre ? [game.games.genre] : ["Unknown"],
          hoursPlayed: Number(game.hours_played),
          achievements: {
            earned: 0, // We'll update this later
            total: 0
          },
          lastPlayed: game.last_played ? new Date(game.last_played).toLocaleDateString() : null
        })) || [];
        
        setGames(transformedGames);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserGames();
  }, [user]);
  
  // Filter games based on search term
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.platforms.some(platform => platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
    game.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Game Library</h1>
        
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
              <p className="text-gray-400 mt-2">Add games through the dashboard to start tracking your progress.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGames.map(game => (
                <GameCard 
                  key={game.id}
                  {...game}
                />
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
    </div>
  );
};

export default Library;
