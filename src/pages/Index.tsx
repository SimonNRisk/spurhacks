import React, { useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import ListingsGrid from '../components/ListingsGrid';

interface SearchTag {
  text: string;
  id: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTags, setSelectedTags] = useState<SearchTag[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleListingCreated = () => {
    // Trigger a refresh of the listings grid
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onListingCreated={handleListingCreated} />
      <HeroSection 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      {/* <FilterSection 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      /> */}
      <ListingsGrid 
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
        selectedTags={selectedTags}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default Index;
