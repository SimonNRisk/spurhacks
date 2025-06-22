import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, User } from 'lucide-react';
import AddListingModal from './AddListingModal';

interface HeaderProps {
  onListingCreated?: () => void;
}

const Header = ({ onListingCreated }: HeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => window.location.href = '/'}>RentHub</h1>
          </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="hidden sm:flex items-center space-x-2"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                <span>List Item</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/profile'}>
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
              <AddListingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onListingCreated={onListingCreated}
      />
      </header>
  );
};

export default Header;
