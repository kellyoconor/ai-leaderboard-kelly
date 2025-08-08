import { useState } from "react";
import Header from "@/components/header";
import LeaderboardTable from "@/components/leaderboard-table";
import HistoryView from "@/components/history-view";
import RankingForm from "@/components/ranking-form";

export default function Home() {
  const [currentView, setCurrentView] = useState<"current" | "history">("current");
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenForm={() => setShowForm(true)}
      />
      
      {currentView === "current" ? (
        <main className="max-w-6xl mx-auto px-8 py-12">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold text-primary-black mb-2">
              Week of {(() => {
                const now = new Date();
                const monday = new Date(now);
                monday.setDate(now.getDate() - now.getDay() + 1);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                
                return `${monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${sunday.getDate()}, ${monday.getFullYear()}`;
              })()}
            </h2>
          </div>
          
          <LeaderboardTable />
        </main>
      ) : (
        <HistoryView />
      )}

      {showForm && (
        <RankingForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
