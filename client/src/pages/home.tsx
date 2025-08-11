import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/header";
import LeaderboardTable from "@/components/leaderboard-table";
import RankingForm from "@/components/ranking-form";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0); // 0 = current week

  const { data: allWeeks } = useQuery<string[]>({
    queryKey: ["/api/rankings/weeks"],
  });

  const currentWeek = allWeeks?.[selectedWeekIndex] || '';

  const formatWeekTitle = (weekOf: string) => {
    if (!weekOf) return '';
    
    const weekDate = new Date(weekOf);
    const monday = new Date(weekDate);
    const sunday = new Date(weekDate);
    sunday.setDate(monday.getDate() + 6);
    
    return `Week of ${monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${sunday.getDate()}, ${monday.getFullYear()}`;
  };

  const canGoPrevious = allWeeks && selectedWeekIndex < allWeeks.length - 1;
  const canGoNext = selectedWeekIndex > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header onOpenForm={() => setShowForm(true)} />
      
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => setSelectedWeekIndex(prev => prev + 1)}
              disabled={!canGoPrevious}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrevious 
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
              disabled={!canGoNext}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext 
                  ? 'text-primary-black hover:bg-light-grey' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        
        <LeaderboardTable weekOf={currentWeek} />
      </main>

      {showForm && (
        <RankingForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
