import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, X } from "lucide-react";

interface SearchTag {
  text: string;
  id: string;
}

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: SearchTag[];
  setSelectedTags: (tags: SearchTag[]) => void;
}

const HeroSection = ({
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
}: HeroSectionProps) => {
  const [location, setLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const analyzeSearchPrompt = async () => {
    if (!searchQuery.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:8000/search/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze search prompt");
      }

      const data = await response.json();

      // Convert tags to SearchTag format with unique IDs
      const newTags: SearchTag[] = data.tags.map(
        (tag: string, index: number) => ({
          text: tag,
          id: `${tag}-${Date.now()}-${index}`,
        })
      );

      setSelectedTags(newTags);

      // Update location if provided
      if (data.location && data.location !== "unknown") {
        setLocation(data.location);
      }

      // Clear the search query after analysis
      setSearchQuery("");
    } catch (error) {
      console.error("Error analyzing search prompt:", error);
      // You might want to show a toast/notification here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      analyzeSearchPrompt();
    }
  };
  return (
    <section className="text-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Need It?<span className="text-primary"> Boro</span>{" "}
          <span className="text-black">It.</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 text-black-thin max-w-3xl mx-auto">
          From ski trips to weekend getaways, find and rent the gear you need -
          right from your neighborhood.
        </p>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            {/* Search Input Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                    isSearchFocused ? "text-primary" : "text-gray-400"
                  }`}
                />
                <Input
                  type="text"
                  placeholder="Tell me what you're looking for."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 border-0 text-gray-900 placeholder-gray-500 focus:ring-0"
                />
              </div>

              <div className="flex-1 relative">
                <MapPin
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                    isLocationFocused ? "text-primary" : "text-gray-400"
                  }`}
                />
                <Input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setIsLocationFocused(true)}
                  onBlur={() => setIsLocationFocused(false)}
                  className="pl-10 border-0 text-gray-900 placeholder-gray-500 focus:ring-0"
                />
              </div>

              <Button
                onClick={analyzeSearchPrompt}
                disabled={isAnalyzing || !searchQuery.trim()}
                className="bg-primary hover:bg-primary-dark text-white px-8 disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing..." : "Search"}
              </Button>
            </div>

            {/* Tags Display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="bg-primary-light border-2 border-primary text-black hover:bg-blue-200 cursor-pointer flex items-center gap-1 px-3 py-1"
                  >
                    <span className="text-sm">
                      {" "}
                      {tag.text.replace(/\b\w/g, (char) => char.toUpperCase())}
                    </span>
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${tag.text} tag`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
