import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Github, ExternalLink, Star, GitFork, Users } from "lucide-react";
import { GitHubContributions } from "./github-contributions";

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

interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

export function GitHubProfile() {
  const [username, setUsername] = useState("koconor");
  const [searchedUsername, setSearchedUsername] = useState("koconor");

  const { data: user, isLoading: userLoading, error: userError } = useQuery<GitHubUser>({
    queryKey: ["/api/github/user", searchedUsername],
    queryFn: () => fetch(`/api/github/user/${searchedUsername}`).then(res => res.json()),
    enabled: !!searchedUsername,
  });



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setSearchedUsername(username.trim());
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Github className="h-5 w-5" />
        <h3 className="text-lg font-medium text-primary-black">GitHub Profile</h3>
      </div>

      {/* Optional Search Form - initially hidden */}
      <details className="mb-6">
        <summary className="cursor-pointer text-sm text-cool-grey hover:text-primary-black">
          Change GitHub username
        </summary>
        <form onSubmit={handleSearch} className="mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update
            </button>
          </div>
        </form>
      </details>

      {/* Loading State */}
      {userLoading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-cool-grey">Loading profile...</div>
        </div>
      )}

      {/* Error State */}
      {userError && (
        <div className="text-center py-8 text-red-600">
          User not found or error loading profile
        </div>
      )}

      {/* User Profile */}
      {user && (
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="w-16 h-16 rounded-full border border-gray-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-primary-black">
                  {user.name || user.login}
                </h4>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cool-grey hover:text-primary-black"
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

          {/* GitHub Contributions */}
          <div className="mt-6">
            <GitHubContributions username={user.login} />
          </div>
        </div>
      )}
    </div>
  );
}