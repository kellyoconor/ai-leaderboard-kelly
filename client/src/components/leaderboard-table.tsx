import { useQuery } from "@tanstack/react-query";
import { type WeeklyRanking } from "@shared/schema";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

interface LeaderboardTableProps {
  weekOf?: string;
}

export default function LeaderboardTable({ weekOf }: LeaderboardTableProps) {
  const { data: allWeeks } = useQuery<string[]>({
    queryKey: ["/api/rankings/weeks"],
  });

  const isCurrentWeek = !weekOf || weekOf === allWeeks?.[0];
  const targetWeek = weekOf || allWeeks?.[0] || '';

  const { data: currentRankings, isLoading } = useQuery<WeeklyRanking[]>({
    queryKey: isCurrentWeek ? ["/api/rankings/current"] : ["/api/rankings/week", targetWeek],
    enabled: !!targetWeek,
  });

  // Get the previous week for comparison
  const currentWeekIndex = allWeeks?.indexOf(targetWeek) || 0;
  const previousWeek = allWeeks?.[currentWeekIndex + 1];

  const { data: lastWeekRankings } = useQuery<WeeklyRanking[]>({
    queryKey: ["/api/rankings/week", previousWeek],
    enabled: !!previousWeek,
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
              <th className="text-left py-3 px-6 font-semibold text-cool-grey text-sm uppercase tracking-wider">Rank</th>
              <th className="text-left py-3 px-4 font-semibold text-cool-grey text-sm uppercase tracking-wider">Change</th>
              <th className="text-left py-3 px-6 font-semibold text-cool-grey text-sm uppercase tracking-wider">Tool</th>
              <th className="text-right py-3 px-6 font-semibold text-cool-grey text-sm uppercase tracking-wider">Weeks at #1</th>
            </tr>
          </thead>
          <tbody>
            {currentRankings.map((ranking) => {
              const positionChange = getPositionChange(ranking.toolName, ranking.rank);
              const Icon = positionChange.icon;
              
              return (
                <tr key={ranking.id} className="border-b border-gray-50 hover:bg-light-grey/20 transition-colors ranking-item">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-primary-black mr-3">{ranking.rank}</span>
                      <div className={`w-1.5 h-6 rounded-full ${ranking.rank === 1 ? 'bg-success-green' : 'bg-gray-300'}`}></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-6">
                    <h4 className="text-lg font-semibold text-primary-black">{ranking.toolName}</h4>
                  </td>
                  <td className="py-4 px-6 text-right">
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
