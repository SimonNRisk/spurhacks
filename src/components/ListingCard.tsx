import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock } from "lucide-react";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  owner: {
    name: string;
    avatar: string;
  };
  availability: string;
  tags: string[];
}

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const isNearby = listing.location.toLowerCase().includes("waterloo");
  const [isHovered, setIsHovered] = React.useState(false);
  const getCity = (location: string) => {
    if (!location) return "Unknown";
    return location.split(",")[0].trim();
  };
  const now = new Date();

  const parsedDate = new Date(`${listing.availability}, 2025`);
  const isAvailable = parsedDate > now;
  return (
    <Card
      className="group transition-all duration-300 overflow-hidden border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.015] flex flex-col h-[360px] bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Database tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
          {listing.tags &&
            listing.tags.slice(0, 3).map((tag, idx) => (
              <Badge
                key={idx}
                className="bg-white/90 text-gray-800 text-xs font-medium"
              >
                {tag}
              </Badge>
            ))}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow justify-between">
        <div className="flex flex-col gap-3 flex-grow">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {listing.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{listing.rating}</span>
              {listing.reviewCount > 0 && (
                <span className="text-gray-400">({listing.reviewCount})</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            {isNearby ? (
              <>
                <div className="relative h-4 w-4">
                  <span className="absolute inset-0 rounded-full bg-primary blur-[6px] opacity-30"></span>
                  <MapPin className="relative h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold">Waterloo</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>{getCity(listing.location)}</span>
              </>
            )}
          </div>
          {isAvailable ? (
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <Clock className="h-4 w-4" />
              <span>{listing.availability}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <Clock className="h-4 w-4" />
              <span>Unavailable</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${listing.price}
            </span>

            <span className="text-gray-500">/{listing.priceUnit || "day"}</span>
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Rent Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
