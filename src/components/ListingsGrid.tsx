"use client";
import React, { useMemo, useEffect, useState } from "react";
import ListingCard, { Listing } from "./ListingCard";
import { Link } from "react-router-dom";
import { filterListings } from "./utils/filterListings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface SearchTag {
  text: string;
  id: string;
}

interface ListingsGridProps {
  selectedCategory?: string;
  selectedLocation: string;
  selectedTags: SearchTag[];
  refreshTrigger?: number;
}

const ListingsGrid = ({
  selectedLocation,
  selectedTags,
  refreshTrigger,
}: ListingsGridProps) => {
  const [allListings, setAllListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | undefined>(
    1000
  );
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched listings:", data);
        const transformed = data.map((item) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description,
          price: item.price,
          priceUnit: "day",
          category: item.tags[0],
          image: item.image_url,
          rating: item.rating,
          reviewCount: item.num_reviews,
          location: item.location,
          owner: {
            name: "John Doe", // placeholder
            avatar: "https://source.unsplash.com/random/100x100/?face",
          },
          availability: item.availability,
          tags: item.tags,
        }));
        setAllListings(transformed);
      })
      .catch((err) => console.error("Error fetching listings:", err));
  }, [refreshTrigger]);

  const filteredListings = useMemo(() => {
    // Normalize helper
    const normalize = (str: string) =>
      str.toLowerCase().trim().replace(/\s+/g, " ");

    // Tag filter (if selectedTags are provided)
    const tagFilter = (listing: Listing) => {
      if (!selectedTags || selectedTags.length === 0) return true;
      if (!listing.tags || listing.tags.length === 0) return false;

      const normalizedSelectedTags = selectedTags.map((tag) =>
        normalize(tag.text)
      );
      return listing.tags.some((listingTag) => {
        const normalizedListingTag = normalize(listingTag);
        return normalizedSelectedTags.some(
          (sel) =>
            normalizedListingTag.includes(sel) ||
            sel.includes(normalizedListingTag) ||
            normalizedListingTag === sel
        );
      });
    };

    // Price + category filter
    const baseFiltered = filterListings(allListings, {
      maxPrice: selectedMaxPrice,
      tag:
        selectedCategory !== "all" && selectedCategory !== ""
          ? selectedCategory
          : undefined,
      minPrice: undefined,
      minRating: undefined,
      availability: undefined,
    });

    // Apply search text and tag filter
    const fullyFiltered = baseFiltered.filter((listing) => tagFilter(listing));

    // Sort by proximity to Waterloo
    const sorted = fullyFiltered.sort((a, b) => {
      const aNearby = a.location.toLowerCase().includes("waterloo");
      const bNearby = b.location.toLowerCase().includes("waterloo");
      return aNearby === bNearby ? 0 : aNearby ? -1 : 1;
    });

    return sorted;
  }, [allListings, selectedTags, selectedCategory, selectedMaxPrice]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + Filter Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedTags.length > 0 ? "Filtered Results" : "Available Items"}
            {selectedLocation === "nearby" && " (Nearby first)"}
          </h2>

          <div className="flex flex-col md:flex-row gap-2 text-gray-600 md:items-center">
            {selectedTags.length > 0 ? (
              <p className="whitespace-nowrap">
                {filteredListings.length} items available for{" "}
                {selectedTags.map((tag) => tag.text).join(", ")}
              </p>
            ) : (
              <p className="whitespace-nowrap">
                {filteredListings.length} items available
              </p>
            )}
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded"
              title="Toggle filters"
            >
              {filtersVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Filter Fields */}
        <div
          className={`
          transition-all duration-300 ease-in-out overflow-hidden mb-6
          ${
            filtersVisible
              ? "opacity-100 max-h-[500px] scale-100"
              : "opacity-0 max-h-0 scale-95"
          }
        `}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-[180px]">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                  <SelectItem value="Camping">Camping</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Canoe">Canoe</SelectItem>
                  <SelectItem value="Kayak">Kayak</SelectItem>
                  <SelectItem value="Board Games">Board Games</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-64 mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price: ${selectedMaxPrice}
              </label>
              <Slider
                defaultValue={[selectedMaxPrice ?? 0]}
                min={0}
                max={1000}
                step={5}
                onValueChange={(value) => setSelectedMaxPrice(value[0])}
              />
            </div>
          </div>
        </div>

        {/* Listings Grid / Loading / Empty States */}
        {filteredListings.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <div className="flex flex-col items-center space-y-6">
              {allListings.length === 0 ? (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-medium text-slate-700">
                      Loading...
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl text-gray-300">🔍</div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-gray-700">
                      No items found
                    </p>
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
