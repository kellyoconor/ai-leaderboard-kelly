import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4 intensity level
}

interface GitHubContributionsProps {
  username: string;
}

export function GitHubContributions({ username }: GitHubContributionsProps) {
  const { data: contributions, isLoading, error } = useQuery<ContributionDay[]>({
    queryKey: ["/api/github/contributions", username],
    queryFn: () => fetch(`/api/github/contributions/${username}`).then(res => res.json()),
    enabled: !!username,
  });

  if (!username) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-cool-grey" />
          <h4 className="text-lg font-medium text-primary-black">GitHub Contributions</h4>
        </div>
        <p className="text-cool-grey text-sm">Enter a username to view contributions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-cool-grey" />
          <h4 className="text-lg font-medium text-primary-black">GitHub Contributions</h4>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-52 gap-1">
            {Array.from({ length: 364 }, (_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !contributions) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-cool-grey" />
          <h4 className="text-lg font-medium text-primary-black">GitHub Contributions</h4>
        </div>
        <p className="text-cool-grey text-sm">Unable to load contributions data</p>
      </div>
    );
  }

  // Calculate stats
  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
  const streakDays = calculateCurrentStreak(contributions);
  const maxDayContributions = Math.max(...contributions.map(day => day.count));

  // Get contribution level color
  const getContributionColor = (level: number) => {
    const colors = [
      'bg-gray-100', // 0 contributions
      'bg-green-200', // 1-3 contributions  
      'bg-green-300', // 4-6 contributions
      'bg-green-500', // 7-9 contributions
      'bg-green-700'  // 10+ contributions
    ];
    return colors[level] || colors[0];
  };

  // Group contributions by week
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-cool-grey" />
        <h4 className="text-lg font-medium text-primary-black">GitHub Contributions</h4>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm mb-4">
        <div>
          <span className="font-medium text-primary-black">{totalContributions}</span>
          <span className="text-cool-grey ml-1">contributions last year</span>
        </div>
        <div>
          <span className="font-medium text-primary-black">{streakDays}</span>
          <span className="text-cool-grey ml-1">day streak</span>
        </div>
        <div>
          <span className="font-medium text-primary-black">{maxDayContributions}</span>
          <span className="text-cool-grey ml-1">max in a day</span>
        </div>
      </div>

      {/* Contributions Grid */}
      <div className="mb-4">
        <div className="grid grid-flow-col auto-cols-max gap-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${getContributionColor(day.level)}`}
                  title={`${day.count} contributions on ${new Date(day.date).toLocaleDateString()}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-cool-grey">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

// Helper function to calculate current streak
function calculateCurrentStreak(contributions: ContributionDay[]): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Start from today and work backwards
  const sortedContributions = [...contributions].reverse();
  
  for (const day of sortedContributions) {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    
    if (dayDate <= today) {
      if (day.count > 0) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  return streak;
}