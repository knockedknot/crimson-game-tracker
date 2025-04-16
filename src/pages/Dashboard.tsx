
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RecentGamesSection from "@/components/dashboard/RecentGamesSection";
import RecentAchievementsSection from "@/components/dashboard/RecentAchievementsSection";
import GameDialog from "@/components/games/GameDialog";
import AchievementDialog from "@/components/games/AchievementDialog";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { loading, recentGames, achievements, stats, refreshData } = useDashboardData();
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [addAchievementOpen, setAddAchievementOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const handleRefresh = () => {
    refreshData();
  };

  const handleAddAchievement = (gameId: string) => {
    setSelectedGameId(gameId);
    setAddAchievementOpen(true);
  };

  // If we have no games, use mock data for display
  const displayGames = recentGames.length > 0 ? recentGames : [];
  const displayAchievements = achievements.length > 0 ? achievements : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader onRefresh={handleRefresh} />
      
      <StatsOverview stats={stats} loading={loading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentGamesSection 
            games={displayGames}
            loading={loading}
            onAddGame={() => setAddGameOpen(true)}
          />
        </div>
        
        <div>
          <RecentAchievementsSection
            achievements={displayAchievements}
            loading={loading}
            hasGames={displayGames.length > 0}
            onAddAchievement={() => {
              if (displayGames.length > 0) {
                handleAddAchievement(displayGames[0].id);
              }
            }}
          />
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
