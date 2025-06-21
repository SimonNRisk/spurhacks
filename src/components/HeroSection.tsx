import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const HeroSection = ({ searchQuery, setSearchQuery }: HeroSectionProps) => {
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
          <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg p-2 shadow-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="What do you need to rent?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 text-gray-900 placeholder-gray-500 focus:ring-0"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Enter location"
                className="pl-10 border-0 text-gray-900 placeholder-gray-500 focus:ring-0"
              />
            </div>
            <Button className="bg-primary hover:bg-primary-dark text-white px-8">
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
