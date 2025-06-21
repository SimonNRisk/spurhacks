
import React, { useMemo } from 'react';
import ListingCard from './ListingCard';
import { mockListings } from '../data/mockListings';

interface ListingsGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
}

const ListingsGrid = ({ searchQuery, selectedCategory, selectedLocation }: ListingsGridProps) => {
  const filteredListings = useMemo(() => {
    return mockListings.filter(listing => {
      const matchesSearch = searchQuery === '' || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
      
      const matchesLocation = selectedLocation === 'all' || listing.location.type === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchQuery, selectedCategory, selectedLocation]);

  // Sort by distance (nearby items first)
  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      if (a.location.type === 'nearby' && b.location.type !== 'nearby') return -1;
      if (b.location.type === 'nearby' && a.location.type !== 'nearby') return 1;
      return a.location.distance - b.location.distance;
    });
  }, [filteredListings]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Items {selectedLocation === 'nearby' && '(Nearby first)'}
          </h2>
          <p className="text-gray-600">{sortedListings.length} items available</p>
        </div>
        
        {sortedListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ListingsGrid;
