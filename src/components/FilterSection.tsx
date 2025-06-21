
import React from 'react';
import { Button } from "@/components/ui/button";

interface FilterSectionProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

const FilterSection = ({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedLocation, 
  setSelectedLocation 
}: FilterSectionProps) => {
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'tools', name: 'Tools & Equipment' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'sports', name: 'Sports & Recreation' },
    { id: 'party', name: 'Party Supplies' },
    { id: 'automotive', name: 'Automotive' }
  ];

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'nearby', name: 'Nearby (< 5 miles)' },
    { id: 'city', name: 'Within City' },
    { id: 'county', name: 'Within County' }
  ];

  return (
    <section className="bg-white py-6 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distance</h3>
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <Button
                  key={location.id}
                  variant={selectedLocation === location.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(location.id)}
                  className="rounded-full"
                >
                  {location.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;
