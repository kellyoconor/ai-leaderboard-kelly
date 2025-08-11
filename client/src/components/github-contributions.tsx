import { useQuery } from "@tanstack/react-query";
import { Calendar, Github, ExternalLink, Users } from "lucide-react";

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4 intensity level
}

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubContributionsProps {
  username: string;
}

// Custom Contribution Calendar Component
function CustomContributionCalendar({ contributions }: { contributions: ContributionDay[] }) {
  if (!contributions || contributions.length === 0) {
    return <div className="text-cool-grey text-sm">No contribution data available</div>;
  }

  // Create a map for quick lookup of contribution data
  const contributionMap = new Map();
  contributions.forEach(day => {
    contributionMap.set(day.date, day);
  });

  // Get the current year and create all dates for the year
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // Jan 1
  const endDate = new Date(currentYear, 11, 31); // Dec 31
  
  // Create weeks array starting from the first Sunday of the year or before
  const weeks = [];
  const firstSunday = new Date(startDate);
  firstSunday.setDate(startDate.getDate() - startDate.getDay()); // Go back to Sunday
  
  let currentDate = new Date(firstSunday);
  
  while (currentDate <= endDate || currentDate.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const contribution = contributionMap.get(dateStr) || { date: dateStr, count: 0, level: 0 };
      week.push(contribution);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
    
    // Break if we've gone past the end of year and completed the week
    if (currentDate > endDate && currentDate.getDay() === 0) break;
  }

  // Color mapping for contribution levels
  const getColor = (level: number) => {
    switch (level) {
      case 0: return '#ebedf0'; // No contributions
      case 1: return '#9be9a8'; // Low
      case 2: return '#40c463'; // Medium-low
      case 3: return '#30a14e'; // Medium-high
      case 4: return '#216e39'; // High
      default: return '#ebedf0';
    }
  };

  // Month labels
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="contribution-calendar">
      {/* Month labels */}
      <div className="flex mb-2">
        <div className="flex-1 flex justify-between text-xs text-gray-600">
          {monthLabels.map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="flex">
        {/* Contribution squares */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const isCurrentYear = new Date(day.date).getFullYear() === currentYear;
                return (
                  <div
                    key={day.date}
                    className="w-3 h-3 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ 
                      backgroundColor: isCurrentYear ? getColor(day.level) : '#f0f0f0',
                      opacity: isCurrentYear ? 1 : 0.3 
                    }}
                    title={`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColor(level) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

export function GitHubContributions({ username }: GitHubContributionsProps) {
  const { data: contributions, isLoading, error } = useQuery<ContributionDay[]>({
    queryKey: ["/api/github/contributions", username],
    queryFn: () => fetch(`/api/github/contributions/${username}`).then(res => res.json()),
    enabled: !!username,
  });

  const { data: user, isLoading: userLoading } = useQuery<GitHubUser>({
    queryKey: ["/api/github/user", username],
    queryFn: () => fetch(`/api/github/user/${username}`).then(res => res.json()),
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
        <div className="text-red-500 text-sm">
          Failed to load contributions data
          <div className="text-xs text-cool-grey mt-1">
            {error?.message || 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }

  // Calculate current streak
  function calculateCurrentStreak(contributions: ContributionDay[]): number {
    if (!contributions || contributions.length === 0) return 0;
    
    // Sort contributions by date (most recent first)
    const sortedContributions = [...contributions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    
    for (const day of sortedContributions) {
      const dayDate = new Date(day.date);
      const daysDiff = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If this day has contributions and is within the current streak
      if (day.count > 0 && daysDiff === streak) {
        streak++;
      } else if (daysDiff === streak) {
        // Day with no contributions, continue checking for streak
        continue;
      } else {
        // Gap in contributions, end streak
        break;
      }
    }
    
    return streak;
  }

  // Calculate stats
  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
  const streakDays = calculateCurrentStreak(contributions);
  const maxDayContributions = Math.max(...contributions.map(day => day.count));
  
  // Get date range
  const getDateRange = (contributions: ContributionDay[]): string => {
    if (!contributions || contributions.length === 0) return '';
    
    const sortedDates = contributions
      .map(c => new Date(c.date))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];
    const today = new Date();
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    // Check if end date is recent (within last 7 days)
    const daysDiff = Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    const isRecent = daysDiff <= 7;
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}${isRecent ? ' (current)' : ''}`;
  };
  
  const dateRange = getDateRange(contributions);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
      <div className="flex items-center gap-2 mb-6">
        <Github className="h-5 w-5 text-cool-grey" />
        <h4 className="text-lg font-medium text-primary-black">GitHub Profile</h4>
      </div>

      {/* GitHub Profile Section */}
      {user && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar_url} 
              alt={`${user.login}'s avatar`}
              className="w-10 h-10 rounded-full border border-gray-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-primary-black">
                  {user.name || user.login}
                </h5>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cool-grey hover:text-primary-black transition-colors"
                  title="View GitHub Profile"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-4 text-xs text-cool-grey mt-1">
                <span>@{user.login}</span>
                <span>{user.public_repos} repos</span>
                {user.followers > 0 && <span>{user.followers} followers</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contributions Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-cool-grey" />
        <h5 className="text-lg font-medium text-primary-black">Contributions</h5>
      </div>



      {/* GitHub Contributions Calendar */}
      <div className="mb-4">
        <div className="w-full overflow-x-auto">
          <div style={{ backgroundColor: '#f6f8fa', padding: '20px', borderRadius: '8px', minWidth: '900px' }}>
            <CustomContributionCalendar contributions={contributions} />
          </div>
        </div>
      </div>

      <div className="text-xs text-cool-grey mt-2">
        {dateRange || 'current year'}
      </div>
    </div>
  );
}