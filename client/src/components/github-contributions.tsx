import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import GitHubCalendar from 'react-github-calendar';

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
          <div className="h-32 bg-gray-200 rounded" />
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
        <p className="text-red-500 text-sm">Failed to load contributions</p>
      </div>
    );
  }

  // Calculate stats
  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
  const streakDays = calculateCurrentStreak(contributions);
  const maxDayContributions = Math.max(...contributions.map(day => day.count));

  // Calculate current streak
  function calculateCurrentStreak(contributions: ContributionDay[]): number {
    if (!contributions || contributions.length === 0) return 0;
    
    // Sort by date descending to start from most recent
    const sortedContributions = [...contributions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    for (const day of sortedContributions) {
      if (day.count > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-cool-grey" />
        <h4 className="text-lg font-medium text-primary-black">GitHub Contributions</h4>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-4 text-sm">
        <div>
          <span className="font-semibold text-primary-black">{totalContributions}</span>
          <span className="text-cool-grey ml-1">contributions</span>
        </div>
        <div>
          <span className="font-semibold text-primary-black">{streakDays}</span>
          <span className="text-cool-grey ml-1">day streak</span>
        </div>
        <div>
          <span className="font-semibold text-primary-black">{maxDayContributions}</span>
          <span className="text-cool-grey ml-1">max in a day</span>
        </div>
      </div>

      {/* GitHub Calendar Component */}
      <div className="mb-4">
        <GitHubCalendar 
          username={username} 
          colorScheme="light"
          fontSize={12}
          blockSize={12}
        />
      </div>

      <div className="text-xs text-cool-grey mt-2">
        last year
      </div>
    </div>
  );
}