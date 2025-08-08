import { useQuery } from "@tanstack/react-query";
import { type WeeklyRanking } from "@shared/schema";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

export default function LeaderboardTable() {
  const { data: currentRankings, isLoading } = useQuery<WeeklyRanking[]>({
    queryKey: ["/api/rankings/current"],
  });

  const { data: allWeeks } = useQuery<string[]>({
    queryKey: ["/api/rankings/weeks"],
  });

  const { data: lastWeekRankings } = useQuery<WeeklyRanking[]>({
    queryKey: ["/api/rankings/week", allWeeks?.[1]],
    enabled: !!allWeeks?.[1],
  });

  const getPositionChange = (toolName: string, currentRank: number) => {
    if (!lastWeekRankings) return { change: "new", icon: null, color: "text-cool-grey" };
    
    const lastWeekRank = lastWeekRankings.find(r => r.toolName === toolName)?.rank;
    
    if (!lastWeekRank) {
      return { change: "NEW", icon: null, color: "text-cool-grey" };
    }
    
    const change = lastWeekRank - currentRank;
    
    if (change > 0) {
      return { change: `+${change}`, icon: TrendingUp, color: "text-success-green" };
    } else if (change < 0) {
      return { change: `${change}`, icon: TrendingDown, color: "text-warning-amber" };
    } else {
      return { change: "0", icon: Minus, color: "text-cool-grey" };
    }
  };

  // Query for weeks at #1 data
  const { data: weeksAtTopData } = useQuery<Array<{toolName: string, count: number}>>(
    {
      queryKey: ["/api/rankings/weeks-at-top"],
      staleTime: 300000, // 5 minutes since this changes rarely
    }
  );

  const getWeeksAtTop = (toolName: string) => {
    return weeksAtTopData?.find(item => item.toolName === toolName)?.count || 0;
  };

  const getToolInitial = (toolName: string) => {
    return toolName.charAt(0).toUpperCase();
  };

  const getGradientClass = (toolName: string) => {
    const gradients = {
      "Claude 3.5 Sonnet": "from-purple-600 to-blue-600",
      "GPT-4 Turbo": "from-green-500 to-teal-600",
      "Midjourney": "from-blue-600 to-cyan-600",
      "Notion AI": "from-red-500 to-pink-600",
      "RunwayML": "from-orange-500 to-red-600",
    };
    return gradients[toolName as keyof typeof gradients] || "from-gray-500 to-gray-600";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-primary-black">Current Rankings</h3>
        </div>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-light-grey rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentRankings || currentRankings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-primary-black">Current Rankings</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-cool-grey">No rankings available for this week. Click "Update Rankings" to add your first set of rankings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-primary-black">Current Rankings</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-light-grey/30">
              <th className="text-left py-4 px-8 font-semibold text-cool-grey text-sm uppercase tracking-wider">Rank</th>
              <th className="text-left py-4 px-4 font-semibold text-cool-grey text-sm uppercase tracking-wider">Change</th>
              <th className="text-left py-4 px-4 font-semibold text-cool-grey text-sm uppercase tracking-wider">Tool</th>
              <th className="text-left py-4 px-4 font-semibold text-cool-grey text-sm uppercase tracking-wider">Activity</th>
              <th className="text-left py-4 px-8 font-semibold text-cool-grey text-sm uppercase tracking-wider">Weeks at #1</th>
            </tr>
          </thead>
          <tbody>
            {currentRankings.map((ranking) => {
              const positionChange = getPositionChange(ranking.toolName, ranking.rank);
              const Icon = positionChange.icon;
              
              return (
                <tr key={ranking.id} className="border-b border-gray-50 hover:bg-light-grey/20 transition-colors ranking-item">
                  <td className="py-6 px-8">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-primary-black mr-4">{ranking.rank}</span>
                      <div className={`w-2 h-8 rounded-full ${ranking.rank === 1 ? 'bg-success-green' : 'bg-gray-300'}`}></div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        positionChange.color.includes('success') ? 'bg-success-green/10' :
                        positionChange.color.includes('warning') ? 'bg-warning-amber/10' : 'bg-gray-100'
                      }`}>
                        {Icon ? (
                          <Icon className={`w-3 h-3 ${positionChange.color}`} />
                        ) : (
                          <span className={`text-xs font-medium ${positionChange.color}`}>
                            {positionChange.change === "NEW" ? "NEW" : "0"}
                          </span>
                        )}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${positionChange.color}`}>
                        {positionChange.change}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(ranking.toolName)} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-semibold text-lg">{getToolInitial(ranking.toolName)}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-primary-black">{ranking.toolName}</h4>
                        <p className="text-sm text-cool-grey">{ranking.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-cool-grey">{ranking.activity}</p>
                  </td>
                  <td className="py-6 px-8">
                    <span className="text-lg font-semibold text-primary-black">{getWeeksAtTop(ranking.toolName)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
