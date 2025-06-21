
import React, { useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FilterSection from '../components/FilterSection';
import ListingsGrid from '../components/ListingsGrid';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      <FilterSection 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      <ListingsGrid 
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
      />
    </div>
  );
};

export default Index;
