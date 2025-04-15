
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import GameCard from "@/components/dashboard/GameCard";

const mockGames = [
  {
    id: 1,
    title: "Elden Ring",
    cover: "https://images.unsplash.com/photo-1605899435973-ca2d1a8ee8e7?q=80&w=500&auto=format&fit=crop",
    platforms: ["PC", "RPG"],
    genres: ["Action", "RPG"],
    hoursPlayed: 80,
    achievements: {
      earned: 32,
      total: 42
    },
    lastPlayed: "4/10/2023"
  },
  {
    id: 2,
    title: "Baldur's Gate 3",
    cover: "https://images.unsplash.com/photo-1637412113429-4b0c8b0b3d3a?q=80&w=500&auto=format&fit=crop",
    platforms: ["PC", "RPG"],
    genres: ["RPG", "Strategy"],
    hoursPlayed: 112,
    achievements: {
      earned: 28,
      total: 50
    },
    lastPlayed: "4/15/2023"
  },
  {
    id: 3,
    title: "Hades",
    cover: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=500&auto=format&fit=crop",
    platforms: ["PC", "Action"],
    genres: ["Roguelike", "Action"],
    hoursPlayed: 45,
    achievements: {
      earned: 22,
      total: 35
    },
    lastPlayed: "3/22/2023"
  },
  {
    id: 4,
    title: "God of War",
    cover: "https://images.unsplash.com/photo-1627856014029-0303bf3c4192?q=80&w=500&auto=format&fit=crop",
    platforms: ["PC", "Action"],
    genres: ["Action", "Adventure"],
    hoursPlayed: 64,
    achievements: {
      earned: 18,
      total: 30
    },
    lastPlayed: "2/18/2023"
  }
];

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter games based on search term
  const filteredGames = mockGames.filter(game => 
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGames.map(game => (
          <GameCard 
            key={game.id}
            {...game}
          />
        ))}
      </div>
      
      {filteredGames.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No games found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Library;
