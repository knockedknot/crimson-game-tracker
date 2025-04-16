
import React from "react";
import { Gamepad2, Clock, Trophy, Calendar } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

interface StatsData {
  totalGames: number;
  totalPlaytime: number;
  totalAchievements: number;
  activeStreak: number;
}

interface StatsOverviewProps {
  stats: StatsData;
  loading: boolean;
}

const StatsOverview = ({ stats, loading }: StatsOverviewProps) => {
  return (
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
  );
};

export default StatsOverview;
