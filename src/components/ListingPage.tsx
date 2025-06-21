import { useEffect } from 'react';
import Header from '../components/Header';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, MapPin, Star, Clock, User, Calendar as CalendarIcon } from 'lucide-react';

function ListingPage() {
const { id } = useParams();
const [selectedDate, setSelectedDate] = useState<Date>();
const [listing, setListing] = useState<any | null | false>(null); // null = loading, false = not found

useEffect(() => {
  fetch('http://127.0.0.1:8000/listings/' + id)
    .then(res => {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(item => {
        console.log(item.user)
      const transformed = {
        id: item.id?.toString(),
        title: item.title,
        description: item.description,
        price: item.price,
        priceUnit: 'day',
        category: 'misc',
        image: item.image_url,
        rating: item.rating, // placeholder
        reviewCount: item.num_reviews,
        location: {
          name: item.location,
          distance: Math.random() * 10,
          type: 'city',
        },
        owner: {
          name: item.user, // placeholder
          avatar: 'https://source.unsplash.com/random/100x100/?face'
        },
        availability: item.availability,
      };
      setListing(transformed);
    })
    .catch(err => {
      console.error('Error fetching listing:', err);
      setListing(false); // explicitly mark as "not found"
    });
}, [id]);

  
if (listing === null) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
  );
}

if (listing === false) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

  // Generate some mock available dates (next 30 days with some gaps)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i < 30; i++) {
      // Skip some random dates to simulate unavailable days
      if (i % 3 !== 0 && i % 7 !== 0) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
        <Header />
    
        {/* Back Link */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to listings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Item Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />

            </div>

            {/* Item Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                <div className="flex items-center space-x-1 text-lg">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{listing.rating}</span>
                  <span className="text-gray-500">({listing.reviewCount} reviews)</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-6">{listing.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{listing.location.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <Clock className="h-5 w-5" />
                  <span>{listing.availability}</span>
                </div>
              </div>

              {/* Owner Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{listing.owner.name}</h3>
                      <p className="text-gray-600">Item owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Booking & Calendar */}
          <div className="space-y-6">
            {/* Price & Booking */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-6 w-6" />
                  <span>Book this item</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold text-gray-900">${listing.price}</span>
                  <span className="text-xl text-gray-600">/{listing.priceUnit}</span>
                </div>

                {/* Calendar */}
                <div>
                  <h3 className="font-semibold mb-3">Select available dates</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today || !isDateAvailable(date);
                    }}
                    className="rounded-md border p-3"
                    modifiers={{
                      available: availableDates,
                    }}
                    modifiersStyles={{
                      available: {
                        backgroundColor: '#dcfce7',
                        color: '#166534'
                      }
                    }}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Green dates are available for rental
                  </p>
                </div>

                {selectedDate && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected: {selectedDate.toLocaleDateString()}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedDate}
                >
                  {selectedDate ? 'Reserve Now' : 'Select a date to reserve'}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>Free cancellation up to 24 hours before pickup</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;