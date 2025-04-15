
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AchievementCard from "@/components/dashboard/AchievementCard";

const mockAchievements = [
  {
    id: 1,
    name: "Legend of the East",
    description: "Attain 100% completion for the single player game.",
    rarity: "Ultra Rare" as const,
    game: "Elden Ring",
    date: "4/9/2023"
  },
  {
    id: 2,
    name: "Master Tactician",
    description: "Win a battle without taking any damage.",
    rarity: "Rare" as const,
    game: "Baldur's Gate 3",
    date: "4/15/2023"
  },
  {
    id: 3,
    name: "Speed Runner",
    description: "Complete the main story in under 30 hours.",
    rarity: "Uncommon" as const,
    game: "Elden Ring",
    date: "4/2/2023"
  },
  {
    id: 4,
    name: "Treasure Hunter",
    description: "Find all hidden treasures in the world.",
    rarity: "Rare" as const,
    game: "God of War",
    date: "3/15/2023"
  },
  {
    id: 5,
    name: "Combo Master",
    description: "Perform a 50-hit combo.",
    rarity: "Common" as const,
    game: "Hades",
    date: "3/10/2023"
  }
];

const Achievements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter achievements based on search term
  const filteredAchievements = mockAchievements.filter(achievement => 
    achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.game.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Achievements</h1>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search achievements..."
            className="pl-10 bg-gray-800 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard 
            key={achievement.id}
            {...achievement}
          />
        ))}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No achievements found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Achievements;
