
import React from "react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader = ({ onRefresh }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Button variant="outline" onClick={onRefresh}>Refresh</Button>
    </div>
  );
};

export default DashboardHeader;
