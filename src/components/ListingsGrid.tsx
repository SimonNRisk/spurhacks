"use client"
import React, { useMemo, useEffect, useState } from 'react';
import ListingCard from './ListingCard';
import { Link } from 'react-router-dom';

interface SearchTag {
  text: string;
  id: string;
}

interface ListingsGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  selectedTags: SearchTag[];
  refreshTrigger?: number;
}

const ListingsGrid = ({ searchQuery, selectedCategory, selectedLocation, selectedTags, refreshTrigger }: ListingsGridProps) => {
  const [allListings, setAllListings] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched listings:', data);
        const transformed = data.map(item => ({
            id: item.id.toString(),
            title: item.title,
            description: item.description,
            price: item.price,
            priceUnit: 'day',
            category: 'misc',
            image: item.image_url,
            rating: item.rating,
            reviewCount: item.num_reviews,
            location: {
              name: item.location,
              distance: Math.random() * 10,
              type: 'city',
            },
            owner: {
              name: 'John Doe', // placeholder
              avatar: 'https://source.unsplash.com/random/100x100/?face'
            },
            availability: item.availability,
            tags: item.tags, // Keep the original tags from backend
          }));
        setAllListings(transformed);
      })
      .catch(err => console.error('Error fetching listings:', err));
  }, [refreshTrigger]);

  // Filter listings based on selected tags
  const filteredListings = useMemo(() => {
    if (selectedTags.length === 0) {
      return allListings; // Show all listings if no tags selected
    }

    // Normalize function to ensure consistent comparison
    const normalizeTag = (tag: string): string => {
      return tag.toLowerCase().trim().replace(/\s+/g, ' ');
    };

    return allListings.filter(listing => {
      // Normalize the selected tag names
      const normalizedSelectedTags = selectedTags.map(tag => normalizeTag(tag.text));
      
      // Check if listing has tags
      if (!listing.tags || listing.tags.length === 0) {
        return false; // Skip listings without tags
      }
      
      // Check if any of the listing's tags match any of the selected tags
      return listing.tags.some(listingTag => {
        const normalizedListingTag = normalizeTag(listingTag);
        
        return normalizedSelectedTags.some(normalizedSelectedTag => {
          // Compare normalized strings with multiple matching strategies
          return normalizedListingTag.includes(normalizedSelectedTag) || 
                 normalizedSelectedTag.includes(normalizedListingTag) ||
                 normalizedListingTag === normalizedSelectedTag;
        });
      });
    });
  }, [allListings, selectedTags]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedTags.length > 0 ? 'Filtered Results' : 'Available Items'} 
            {selectedLocation === 'nearby' && ' (Nearby first)'}
          </h2>
          <div className="text-right">
            <p className="text-gray-600">{filteredListings.length} items available</p>
            {selectedTags.length > 0 && (
              <p className="text-sm text-blue-600 font-medium">
                Showing results for: {selectedTags.map(tag => tag.text).join(', ')}
              </p>
            )}
          </div>
        </div>
        
        {filteredListings.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <div className="flex flex-col items-center space-y-6">
              {allListings.length === 0 ? (
                // Still loading
                <>
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-medium text-slate-700">Loading...</p>
                  </div>
                </>
              ) : (
                // No results for selected tags
                <div className="text-center space-y-4">
                  <div className="text-6xl text-gray-300">🔍</div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-gray-700">No items found</p>
                    <p className="text-gray-500">
                      Try removing some tags or search for different items
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Link to={`/listings/${listing.id}`} key={listing.id}>
                <ListingCard listing={listing} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ListingsGrid;
