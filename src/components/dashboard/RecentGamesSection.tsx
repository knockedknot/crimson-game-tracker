
import React from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Game {
  id: string;
  title: string;
  platforms: string[];
  genres: string[];
  hoursPlayed: number;
  achievements: {
    earned: number;
    total: number;
  };
  lastPlayed: string | null;
}

interface RecentGamesSectionProps {
  games: Game[];
  loading: boolean;
  onAddGame: () => void;
}

const RecentGamesSection = ({ games, loading, onAddGame }: RecentGamesSectionProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recently Played</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddGame}
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
          {games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map(game => (
                <div key={game.id} className="bg-card rounded-lg border border-gray-800 p-4">
                  <h3 className="text-lg font-semibold mb-2">{game.title}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {game.platforms.map((platform) => (
                      <span key={platform} className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded">{platform}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
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
                    <div className="text-xs text-gray-400 mt-1">
                      Last played: {game.lastPlayed}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-gray-800 p-6 text-center">
              <p className="text-gray-400">You haven't added any games yet.</p>
              <Button 
                onClick={onAddGame}
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
  );
};

export default RecentGamesSection;
