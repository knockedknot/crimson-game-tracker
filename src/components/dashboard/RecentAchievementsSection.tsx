
import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AchievementCard from "@/components/dashboard/AchievementCard";

interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra Rare";
  game: string;
  game_id: string;
  date: string;
}

interface RecentAchievementsSectionProps {
  achievements: Achievement[];
  loading: boolean;
  hasGames: boolean;
  onAddAchievement: () => void;
}

const RecentAchievementsSection = ({ 
  achievements, 
  loading, 
  hasGames,
  onAddAchievement 
}: RecentAchievementsSectionProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Achievements</h2>
        {hasGames && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddAchievement}
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
          {achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map(achievement => (
                <AchievementCard 
                  key={achievement.id}
                  {...achievement}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-gray-800 p-6 text-center">
              <p className="text-gray-400">No achievements unlocked yet.</p>
              {hasGames && (
                <Button 
                  onClick={onAddAchievement}
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
  );
};

export default RecentAchievementsSection;
