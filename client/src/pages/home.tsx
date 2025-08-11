import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/header";
import LeaderboardTable from "@/components/leaderboard-table";
import RankingForm from "@/components/ranking-form";
import { SearchFilter } from "@/components/search-filter";
import { GitHubProfile } from "@/components/github-profile";
import { GitHubContributions } from "@/components/github-contributions";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0); // 0 = current week
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [weekFilter, setWeekFilter] = useState<string | null>(null);

  const { data: allWeeks } = useQuery<string[]>({
    queryKey: ["/api/rankings/weeks"],
  });

  const getCurrentWeekString = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  };

  const formatWeekTitle = (weekOf: string) => {
    if (!weekOf) {
      // If no weekOf provided, show current week
      const currentWeekStr = getCurrentWeekString();
      const weekDate = new Date(currentWeekStr + 'T00:00:00'); // Force local timezone
      const monday = new Date(weekDate);
      const sunday = new Date(weekDate);
      sunday.setDate(monday.getDate() + 6);
      return `Week of ${monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${sunday.getDate()}, ${monday.getFullYear()}`;
    }
    
    // weekOf should already be a Monday date (e.g., "2025-08-04")
    const weekDate = new Date(weekOf + 'T00:00:00'); // Force local timezone
    const monday = new Date(weekDate);
    const sunday = new Date(weekDate);
    sunday.setDate(monday.getDate() + 6);
    
    return `Week of ${monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${sunday.getDate()}, ${monday.getFullYear()}`;
  };

  // If selectedWeekIndex is 0, show actual current week, otherwise show historical week
  const currentWeek = selectedWeekIndex === 0 ? getCurrentWeekString() : (allWeeks?.[selectedWeekIndex - 1] || '');

  // Left arrow goes to older weeks, right arrow to newer weeks
  // When selectedWeekIndex is 0, we show current week (2025-08-11)
  // When selectedWeekIndex is 1, we show first historical week (2025-08-04)
  const canGoOlder = allWeeks && (selectedWeekIndex === 0 || selectedWeekIndex < allWeeks.length);
  const canGoNewer = selectedWeekIndex > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header onOpenForm={() => setShowForm(true)} />
      
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => setSelectedWeekIndex(prev => prev + 1)}
              disabled={!canGoOlder}
              title="Go to older week"
              className={`p-2 rounded-lg transition-colors ${
                canGoOlder 
                  ? 'text-primary-black hover:bg-light-grey' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="min-w-[300px]">
              <h2 className="text-3xl font-semibold text-primary-black mb-2">
                {formatWeekTitle(currentWeek)}
              </h2>
              {selectedWeekIndex === 0 && (
                <p className="text-cool-grey text-sm">Current Week</p>
              )}
            </div>
            
            <button
              onClick={() => setSelectedWeekIndex(prev => prev - 1)}
              disabled={!canGoNewer}
              title="Go to newer week"
              className={`p-2 rounded-lg transition-colors ${
                canGoNewer 
                  ? 'text-primary-black hover:bg-light-grey' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <SearchFilter
          onToolSearch={setToolSearchQuery}
          onWeekFilter={setWeekFilter}
          availableWeeks={allWeeks || []}
          selectedWeek={weekFilter}
          toolSearchQuery={toolSearchQuery}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LeaderboardTable 
              weekOf={currentWeek} 
              toolSearchQuery={toolSearchQuery}
              weekFilter={weekFilter}
            />
          </div>
          
          <div className="lg:col-span-1">
            <GitHubProfile />
          </div>
        </div>
        
        {/* GitHub Contributions - Full Width Below Rankings */}
        <div className="mt-8">
          <GitHubContributions username="kellyoconor" />
        </div>
      </main>

      {showForm && (
        <RankingForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
