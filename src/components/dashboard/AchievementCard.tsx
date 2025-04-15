
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AchievementCardProps {
  name: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra Rare";
  game: string;
  date: string;
}

const AchievementCard = ({ 
  name, 
  description, 
  rarity, 
  game, 
  date 
}: AchievementCardProps) => {
  // Determine badge style based on rarity
  const getBadgeClass = () => {
    switch (rarity) {
      case "Ultra Rare":
      case "Rare":
        return "badge-rare";
      case "Uncommon":
        return "badge-uncommon";
      default:
        return "bg-gray-600 text-white text-xs px-2 py-0.5 rounded font-semibold";
    }
  };

  return (
    <Card className="bg-card border-gray-800 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-crimson/20 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-crimson" />
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{name}</h4>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
              <span className={getBadgeClass()}>{rarity}</span>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{game}</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
