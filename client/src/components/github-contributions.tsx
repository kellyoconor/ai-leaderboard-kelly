import { useQuery } from "@tanstack/react-query";
import { Calendar, Github, ExternalLink, Users } from "lucide-react";
import GitHubCalendar from 'react-github-calendar';

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
        <p className="text-red-500 text-sm">Failed to load contributions</p>
      </div>
    );
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
      <div className="flex items-center gap-2 mb-6">
        <Github className="h-5 w-5 text-cool-grey" />
        <h4 className="text-lg font-medium text-primary-black">GitHub Profile</h4>
      </div>

      {/* GitHub Profile Section */}
      {user && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={user.avatar_url} 
              alt={`${user.login}'s avatar`}
              className="w-16 h-16 rounded-full border border-gray-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="text-lg font-medium text-primary-black">
                  {user.name || user.login}
                </h5>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cool-grey hover:text-primary-black transition-colors"
                  title="View GitHub Profile"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-cool-grey text-sm">@{user.login}</p>
              {user.bio && (
                <p className="text-sm text-primary-black mt-2">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-cool-grey">{user.public_repos} repos</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-cool-grey" />
              <span className="text-cool-grey">{user.followers} followers</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-cool-grey" />
              <span className="text-cool-grey">{user.following} following</span>
            </div>
          </div>
        </div>
      )}

      {/* Contributions Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-cool-grey" />
        <h5 className="text-lg font-medium text-primary-black">Contributions</h5>
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

      {/* GitHub Contributions Calendar */}
      <div className="mb-4">
        <div className="w-full overflow-x-auto">
          <div style={{ backgroundColor: '#f6f8fa', padding: '20px', borderRadius: '8px', minWidth: '900px' }}>
            <GitHubCalendar 
              username={username}
              blockSize={13}
              blockMargin={3}
              colorScheme="light"
              fontSize={14}
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-cool-grey mt-2">
        {dateRange || 'last year'}
      </div>
    </div>
  );
}