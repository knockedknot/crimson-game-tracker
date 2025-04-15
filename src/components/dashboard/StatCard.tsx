
import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard = ({ title, value, icon, subtitle, trend }: StatCardProps) => {
  return (
    <Card className="bg-card border-gray-800">
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
        <div className="text-sm text-gray-400 font-medium">{title}</div>
        <span className="text-gray-500">{icon}</span>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className={`text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
