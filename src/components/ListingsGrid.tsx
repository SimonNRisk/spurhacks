"use client"
import React, { useMemo, useEffect, useState } from 'react';
import ListingCard from './ListingCard';
import { Link } from 'react-router-dom';

interface ListingsGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
}

const ListingsGrid = ({ searchQuery, selectedCategory, selectedLocation }: ListingsGridProps) => {
  const [listings, setListings] = useState([]);
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
            category: item.tags[0],
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
          }));
        setListings(transformed);
      })
      .catch(err => console.error('Error fetching listings:', err));
  }, []);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Items {selectedLocation === 'nearby' && '(Nearby first)'}
          </h2>
          <p className="text-gray-600">{listings.length} items available</p>
        </div>
        
        {listings.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <div className="flex flex-col items-center space-y-6">
              {/* Enhanced spinning loader */}
              <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                
                {/* Spinning ring */}
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin"></div>
              </div>

              {/* Text with animated dots */}
              <div className="text-center space-y-2">
                <p className="text-xl font-medium text-slate-700">
                  Loading...
                </p>
              </div>
            </div>
    </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
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
