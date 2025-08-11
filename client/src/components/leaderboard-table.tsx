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

  // Determine if this is the actual current week (today's week)
  const getCurrentWeekString = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  };

  const actualCurrentWeek = getCurrentWeekString();
  const isCurrentWeek = weekOf === actualCurrentWeek;
  const targetWeek = weekOf || actualCurrentWeek;

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
    // If we don't have last week's data yet, show loading state
    if (lastWeekRankings === undefined) {
      return { change: "-", icon: null, color: "text-cool-grey" };
    }
    
    // If we have last week's data but this tool wasn't in it
    if (!lastWeekRankings) {
      return { change: "NEW", icon: null, color: "text-cool-grey" };
    }
    
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

  // Query for weeks at #1 data (contextual to the current week being viewed)
  const { data: weeksAtTopData } = useQuery<Array<{toolName: string, count: number}>>(
    {
      queryKey: ["/api/rankings/weeks-at-top", targetWeek],
      queryFn: () => fetch(`/api/rankings/weeks-at-top?upToWeek=${targetWeek}`).then(res => res.json()),
      staleTime: 300000, // 5 minutes since this changes rarely
    }
  );

  const getWeeksAtTop = (toolName: string) => {
    return weeksAtTopData?.find(item => item.toolName === toolName)?.count || 0;
  };



  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-primary-black">Rankings</h3>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4 font-medium text-cool-grey text-sm">#</th>
              <th className="text-left py-2 px-3 font-medium text-cool-grey text-sm">±</th>
              <th className="text-left py-2 px-4 font-medium text-cool-grey text-sm">Tool</th>
              <th className="text-right py-2 px-4 font-medium text-cool-grey text-sm">Weeks at #1</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-100 animate-pulse">
                <td className="py-3 px-4">
                  <div className="h-6 w-4 bg-gray-200 rounded"></div>
                </td>
                <td className="py-3 px-3">
                  <div className="h-4 w-6 bg-gray-200 rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="h-5 w-4 bg-gray-200 rounded ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!currentRankings || currentRankings.length === 0) {
    // Check if this is the current week (no data yet) vs historical week
    const isNewWeek = isCurrentWeek && weekOf === new Date().toISOString().split('T')[0].replace(/\d{2}$/, (match) => {
      const day = parseInt(match);
      const weekStart = day - new Date().getDay() + 1;
      return weekStart.toString().padStart(2, '0');
    });
    
    return (
      <div className="bg-white border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-primary-black">Rankings</h3>
        </div>
        <div className="p-6 text-center space-y-3">
          {isCurrentWeek ? (
            <>
              <p className="text-lg text-primary-black font-medium">Ready for this week's rankings?</p>
              <p className="text-cool-grey">Click "Update Rankings" to add your top 5 AI tools for this week.</p>
            </>
          ) : (
            <p className="text-cool-grey">No rankings available for this week.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-primary-black">Rankings</h3>
      </div>
      
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-4 font-medium text-cool-grey text-sm">#</th>
            <th className="text-left py-2 px-3 font-medium text-cool-grey text-sm">±</th>
            <th className="text-left py-2 px-4 font-medium text-cool-grey text-sm">Tool</th>
            <th className="text-right py-2 px-4 font-medium text-cool-grey text-sm">Weeks at #1</th>
          </tr>
        </thead>
        <tbody>
          {currentRankings.map((ranking) => {
            const positionChange = getPositionChange(ranking.toolName, ranking.rank);
            
            return (
              <tr key={ranking.id} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <span className="text-lg font-bold text-primary-black">{ranking.rank}</span>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-sm font-medium ${positionChange.color}`}>
                    {positionChange.change}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-base font-medium text-primary-black">{ranking.toolName}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-base font-medium text-primary-black">{getWeeksAtTop(ranking.toolName)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
