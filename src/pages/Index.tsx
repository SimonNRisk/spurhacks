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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
      />
    </div>
  );
};

export default Index;
