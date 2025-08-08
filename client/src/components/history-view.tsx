import { useQuery } from "@tanstack/react-query";
import { type WeeklyRanking } from "@shared/schema";
import { useState } from "react";

export default function HistoryView() {
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  const { data: allWeeks } = useQuery<string[]>({
    queryKey: ["/api/rankings/weeks"],
  });

  const { data: historicalRankings } = useQuery<WeeklyRanking[]>({
    queryKey: ["/api/rankings/history"],
    staleTime: 30000,
  });

  // Group rankings by week for the comparison table
  const rankingsByWeek = historicalRankings?.reduce((acc, ranking) => {
    if (!acc[ranking.weekOf]) {
      acc[ranking.weekOf] = [];
    }
    acc[ranking.weekOf].push(ranking);
    return acc;
  }, {} as Record<string, WeeklyRanking[]>) || {};

  // Get unique tools across all weeks
  const allTools = Array.from(new Set(historicalRankings?.map(r => r.toolName) || []));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      "Perplexity AI": "from-indigo-500 to-purple-600",
    };
    return gradients[toolName as keyof typeof gradients] || "from-gray-500 to-gray-600";
  };

  const getRankForWeek = (toolName: string, weekOf: string) => {
    const weekRankings = rankingsByWeek[weekOf];
    return weekRankings?.find(r => r.toolName === toolName)?.rank;
  };

  return (
    <section className="max-w-6xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-primary-black mb-4">Historical Rankings</h2>
        <p className="text-cool-grey text-lg">Track how your AI tool preferences have evolved over time</p>
      </div>

      {/* Week Selection */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {allWeeks?.map((week, index) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                index === 0 || selectedWeek === week
                  ? "bg-primary-black text-white"
                  : "bg-light-grey text-cool-grey hover:bg-gray-200"
              }`}
            >
              {formatDate(week)}
            </button>
          ))}
        </div>
      </div>



      {/* Historical Rankings Table */}
      {allWeeks && allWeeks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-primary-black">Past {Math.min(4, allWeeks.length)} Weeks Comparison</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-light-grey/30">
                  <th className="text-left py-4 px-8 font-semibold text-cool-grey text-sm uppercase tracking-wider">Tool</th>
                  {allWeeks.slice(0, 4).map((week) => (
                    <th key={week} className="text-center py-4 px-4 font-semibold text-cool-grey text-sm uppercase tracking-wider">
                      {formatDate(week)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTools.map((tool) => (
                  <tr key={tool} className="border-b border-gray-50 hover:bg-light-grey/20 transition-colors">
                    <td className="py-4 px-8">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${getGradientClass(tool)} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-semibold text-sm">{getToolInitial(tool)}</span>
                        </div>
                        <span className="font-medium text-primary-black">{tool}</span>
                      </div>
                    </td>
                    {allWeeks.slice(0, 4).map((week) => {
                      const rank = getRankForWeek(tool, week);
                      return (
                        <td key={week} className="py-4 px-4 text-center">
                          {rank ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                              rank === 1 ? 'bg-success-green text-white' : 'bg-gray-300 text-primary-black'
                            }`}>
                              {rank}
                            </span>
                          ) : (
                            <span className="text-cool-grey">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
