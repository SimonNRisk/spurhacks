import { Listing } from "src/components/ListingCard.tsx";

type FilterOptions = {
  tag?: string;
  maxPrice?: number;
};

// Simple conflicts to avoid obvious mismatches
const CONFLICTS = {
  'summer': ['winter', 'snow', 'ski', 'skiing', 'cold', 'ice'],
  'winter': ['summer', 'beach', 'hot', 'warm', 'pool'],
  'water': ['snow', 'ski', 'skiing', 'winter'],
  'snow': ['water', 'beach', 'summer', 'pool', 'swimming'],
  'kayak': ['ski', 'skiing', 'snow', 'winter'],
  'ski': ['water', 'kayak', 'swimming', 'beach', 'summer']
};

// Generic terms that need context to be meaningful
const GENERIC_TERMS = ['gear', 'equipment', 'stuff', 'items', 'tools', 'supplies'];
const CONTEXT_TERMS = ['winter', 'summer', 'water', 'outdoor', 'camping', 'gaming', 'sports'];

// Clean tag matching function with compound term handling
export function isRelevantMatch(listingTags: string[], searchTags: string[]): boolean {
  if (!searchTags || searchTags.length === 0) return true;
  if (!listingTags || listingTags.length === 0) return false;

  const listingTagsLower = listingTags.map(tag => tag.toLowerCase().trim());
  const searchTagsLower = searchTags.map(tag => tag.toLowerCase().trim());

  // Check for conflicts first
  for (const searchTag of searchTagsLower) {
    const conflicts = CONFLICTS[searchTag] || [];
    if (listingTagsLower.some(listingTag => 
      conflicts.some(conflict => listingTag.includes(conflict))
    )) {
      return false; // Has conflicting tags
    }
  }

  // Require at least half of search tags to have good matches
  const requiredMatches = Math.ceil(searchTags.length / 2);
  let matchCount = 0;

  for (const searchTag of searchTagsLower) {
    const hasMatch = listingTagsLower.some(listingTag => {
      // Exact match (best)
      if (listingTag === searchTag) return true;
      
      // Handle compound terms like "winter gear"
      if (searchTag.includes(' ')) {
        const searchWords = searchTag.split(' ');
        const listingWords = listingTag.split(' ');
        
        // For compound search terms, require both context AND generic term to match
        const hasContext = searchWords.some(word => 
          CONTEXT_TERMS.includes(word) && 
          (listingWords.includes(word) || listingTag.includes(word))
        );
        const hasGeneric = searchWords.some(word => 
          GENERIC_TERMS.includes(word) && 
          (listingWords.includes(word) || listingTag.includes(word))
        );
        
        if (hasContext && hasGeneric) return true;
        
        // All words in compound term should match
        return searchWords.every(word => listingTag.includes(word));
      }
      
      // Single word matching - be more restrictive with generic terms
      if (GENERIC_TERMS.includes(searchTag)) {
        // Generic terms only match if listing has context
        return listingTag === searchTag && 
               listingTagsLower.some(tag => CONTEXT_TERMS.some(ctx => tag.includes(ctx)));
      }
      
      // Regular substring matching for specific terms
      if (searchTag.length > 3 && listingTag.includes(searchTag)) return true;
      if (listingTag.length > 3 && searchTag.includes(listingTag)) return true;
      
      return false;
    });
    
    if (hasMatch) matchCount++;
  }

  return matchCount >= requiredMatches;
}

export function filterListings(listings, filters) {
  return listings.filter((item) => {
    const matchTag = filters.tag ? item.tags.includes(filters.tag) : true;

    const matchMaxPrice =
      filters.maxPrice !== undefined ? item.price <= filters.maxPrice : true;

    return matchTag && matchMaxPrice;
  });
}
