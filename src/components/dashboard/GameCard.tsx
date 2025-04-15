
import { Clock, Trophy } from "lucide-react";

interface GameCardProps {
  title: string;
  cover: string;
  platforms: string[];
  genres: string[];
  hoursPlayed: number;
  achievements: {
    earned: number;
    total: number;
  };
  lastPlayed: string;
}

const GameCard = ({ 
  title, 
  cover, 
  platforms, 
  genres, 
  hoursPlayed, 
  achievements, 
  lastPlayed 
}: GameCardProps) => {
  return (
    <div className="game-card">
      <img 
        src={cover} 
        alt={`${title} cover`} 
        className="w-full h-48 object-cover"
      />
      <div className="game-card-overlay">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex mt-1 mb-2">
          {platforms.map((platform) => (
            <span key={platform} className="platform-badge">{platform}</span>
          ))}
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center text-sm text-gray-300">
            <Clock className="w-4 h-4 mr-1" />
            <span>{hoursPlayed}h</span>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Trophy className="w-4 h-4 mr-1" />
            <span>{achievements.earned}/{achievements.total}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Last played: {lastPlayed}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
