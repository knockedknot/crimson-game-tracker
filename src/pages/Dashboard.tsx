
import { 
  Gamepad2, 
  Clock, 
  Trophy, 
  Calendar 
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import GameCard from "@/components/dashboard/GameCard";
import AchievementCard from "@/components/dashboard/AchievementCard";

const mockRecentGames = [
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
  }
];

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
  }
];

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Games"
          value="24"
          icon={<Gamepad2 />}
          subtitle="Across all platforms"
        />
        <StatCard 
          title="Total Playtime"
          value="328h"
          icon={<Clock />}
          subtitle="Last 30 days"
          trend={{ value: "12%", positive: true }}
        />
        <StatCard 
          title="Achievements"
          value="148/256"
          icon={<Trophy />}
          subtitle="57% completion rate"
          trend={{ value: "5%", positive: true }}
        />
        <StatCard 
          title="Active Streak"
          value="8 days"
          icon={<Calendar />}
          subtitle="Personal best: 14 days"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockRecentGames.map(game => (
              <GameCard 
                key={game.id}
                {...game}
              />
            ))}
          </div>
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
          <div className="space-y-4">
            {mockAchievements.map(achievement => (
              <AchievementCard 
                key={achievement.id}
                {...achievement}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
