import { Listing } from "src/components/ListingCard.tsx";

type FilterOptions = {
  tag?: string;
  maxPrice?: number;
};

export function filterListings(listings, filters) {
  return listings.filter((item) => {
    const matchTag = filters.tag ? item.tags.includes(filters.tag) : true;

    const matchMaxPrice =
      filters.maxPrice !== undefined ? item.price <= filters.maxPrice : true;

    return matchTag && matchMaxPrice;
  });
}
