import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: {
    name: string;
    distance: number;
    type: string;
  };
  owner: {
    name: string;
    avatar: string;
  };
  availability: string;
}

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md hover:scale-105 flex flex-col h-[420px]">
      <div className="relative overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          {/* <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {listing.category}
          </Badge> */}
        </div>
        {listing.location.type === 'nearby' && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 text-white">Nearby</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-grow justify-between">
        <div className="flex flex-col gap-3 flex-grow">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{listing.title}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{listing.rating}</span>
              <span className="text-gray-400">({listing.reviewCount})</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{listing.location.name}</span>
          </div>

          <div className="flex items-center space-x-1 text-sm text-green-600">
            <Clock className="h-4 w-4" />
            <span>{listing.availability}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${listing.price}</span>
            <span className="text-gray-500">/{listing.priceUnit}</span>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Rent Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
