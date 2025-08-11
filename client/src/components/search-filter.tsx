import { useState } from "react";
import { Search, Calendar, X } from "lucide-react";

interface SearchFilterProps {
  onToolSearch: (query: string) => void;
  onWeekFilter: (week: string | null) => void;
  availableWeeks: string[];
  selectedWeek: string | null;
  toolSearchQuery: string;
}

export function SearchFilter({ 
  onToolSearch, 
  onWeekFilter, 
  availableWeeks, 
  selectedWeek,
  toolSearchQuery 
}: SearchFilterProps) {
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);

  const formatWeekDisplay = (week: string) => {
    const date = new Date(week);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Tool Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cool-grey" />
        <input
          type="text"
          placeholder="Search tools..."
          value={toolSearchQuery}
          onChange={(e) => onToolSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {toolSearchQuery && (
          <button
            onClick={() => onToolSearch("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cool-grey hover:text-primary-black"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Week Filter */}
      <div className="relative">
        <button
          onClick={() => setIsWeekDropdownOpen(!isWeekDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Calendar className="h-4 w-4 text-cool-grey" />
          <span className="text-sm">
            {selectedWeek ? formatWeekDisplay(selectedWeek) : "All weeks"}
          </span>
        </button>

        {isWeekDropdownOpen && (
          <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
            <button
              onClick={() => {
                onWeekFilter(null);
                setIsWeekDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                !selectedWeek ? "bg-blue-50 text-blue-700" : ""
              }`}
            >
              All weeks
            </button>
            {availableWeeks.map((week) => (
              <button
                key={week}
                onClick={() => {
                  onWeekFilter(week);
                  setIsWeekDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  selectedWeek === week ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                {formatWeekDisplay(week)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(toolSearchQuery || selectedWeek) && (
        <button
          onClick={() => {
            onToolSearch("");
            onWeekFilter(null);
          }}
          className="px-4 py-2 text-sm text-cool-grey hover:text-primary-black border border-gray-200 rounded-md hover:bg-gray-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}