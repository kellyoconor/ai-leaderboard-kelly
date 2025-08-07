import { useQuery } from "@tanstack/react-query";
import { type WeeklyRanking } from "@shared/schema";
import { TrendingUp, Clipboard, Heart } from "lucide-react";

export default function WeeklyStats() {
  const { data: currentRankings } = useQuery<WeeklyRanking[]>({
    queryKey: ["/api/rankings/current"],
  });

  // Calculate mock stats - in a real app these would be actual tracked metrics
  const totalHours = 32; // Mock data
  const tasksCompleted = currentRankings ? currentRankings.length * 3 + 3 : 18; // Mock calculation
  const favoriteStreak = 2; // Mock data for Claude

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-success-green" />
        </div>
        <h3 className="text-2xl font-bold text-primary-black mb-2">{totalHours}</h3>
        <p className="text-cool-grey">Hours with AI tools this week</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-primary-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clipboard className="w-8 h-8 text-primary-black" />
        </div>
        <h3 className="text-2xl font-bold text-primary-black mb-2">{tasksCompleted}</h3>
        <p className="text-cool-grey">Tasks completed</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-warning-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-warning-amber" />
        </div>
        <h3 className="text-2xl font-bold text-primary-black mb-2">{favoriteStreak}</h3>
        <p className="text-cool-grey">Week streak for Claude</p>
      </div>
    </div>
  );
}
