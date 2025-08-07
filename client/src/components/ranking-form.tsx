import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { weeklyRankingsBatchSchema, type WeeklyRankingsBatch } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface RankingFormProps {
  onClose: () => void;
}

type RankingEntry = {
  rank: number;
  toolName: string;
  category: string;
  activity: string;
};

const categories = [
  "Code & Writing",
  "General AI Assistant", 
  "Image Generation",
  "Productivity & Notes",
  "Video Generation",
  "Research",
  "Other"
];

export default function RankingForm({ onClose }: RankingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rankings, setRankings] = useState<RankingEntry[]>([
    { rank: 1, toolName: "", category: "", activity: "" },
    { rank: 2, toolName: "", category: "", activity: "" },
    { rank: 3, toolName: "", category: "", activity: "" },
    { rank: 4, toolName: "", category: "", activity: "" },
    { rank: 5, toolName: "", category: "", activity: "" },
  ]);

  const getCurrentWeekString = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  };

  const saveMutation = useMutation({
    mutationFn: async (data: WeeklyRankingsBatch) => {
      const response = await apiRequest("POST", "/api/rankings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      toast({
        title: "Rankings saved!",
        description: "Your weekly rankings have been updated successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error saving rankings",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRanking = (rank: number, field: keyof Omit<RankingEntry, 'rank'>, value: string) => {
    setRankings(prev => 
      prev.map(r => r.rank === rank ? { ...r, [field]: value } : r)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const isValid = rankings.every(r => r.toolName.trim() && r.category.trim() && r.activity.trim());
    
    if (!isValid) {
      toast({
        title: "Please complete all fields",
        description: "All tools must have a name, category, and activity description.",
        variant: "destructive",
      });
      return;
    }

    const batch: WeeklyRankingsBatch = {
      weekOf: getCurrentWeekString(),
      rankings: rankings.map(r => ({
        rank: r.rank,
        toolName: r.toolName.trim(),
        category: r.category,
        activity: r.activity.trim(),
      })),
    };

    try {
      weeklyRankingsBatchSchema.parse(batch);
      saveMutation.mutate(batch);
    } catch (error) {
      toast({
        title: "Validation error",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-card max-w-2xl w-full max-h-screen overflow-y-auto mx-4">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-primary-black">Update This Week's Rankings</h3>
          <button
            onClick={onClose}
            className="text-cool-grey hover:text-primary-black transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {rankings.map((ranking) => (
            <div key={ranking.rank} className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                  ranking.rank === 1 ? 'bg-success-green text-white' : 'bg-gray-300 text-primary-black'
                }`}>
                  #{ranking.rank}
                </span>
                <h4 className="text-lg font-semibold text-primary-black">
                  {ranking.rank === 1 ? 'Top Choice' : 
                   ranking.rank === 2 ? 'Second Choice' :
                   ranking.rank === 3 ? 'Third Choice' :
                   ranking.rank === 4 ? 'Fourth Choice' : 'Fifth Choice'}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-cool-grey mb-2">AI Tool Name</Label>
                  <Input
                    type="text"
                    value={ranking.toolName}
                    onChange={(e) => updateRanking(ranking.rank, 'toolName', e.target.value)}
                    placeholder="e.g., Claude 3.5 Sonnet"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-cool-grey mb-2">Category</Label>
                  <Select value={ranking.category} onValueChange={(value) => updateRanking(ranking.rank, 'category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-cool-grey mb-2">What did you accomplish this week?</Label>
                <Textarea
                  value={ranking.activity}
                  onChange={(e) => updateRanking(ranking.rank, 'activity', e.target.value)}
                  placeholder="Describe your key activities and achievements..."
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 bg-primary-black text-white hover:bg-gray-800"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save Rankings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
