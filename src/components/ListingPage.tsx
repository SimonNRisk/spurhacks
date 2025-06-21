import { useEffect } from 'react';
import Header from '../components/Header';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, MapPin, Star, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { set } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';



function ListingPage() {
const { id } = useParams();
const [selectedRange, setSelectedRange] = useState<{ from: Date; to?: Date }>();
const [listing, setListing] = useState<any | null | false>(null); // null = loading, false = not found
const [unavailableRanges, setUnavailableRanges] = useState<{ start: string; end: string }[]>([]);
const [showModal, setShowModal] = useState(false);
const [message, setMessage] = useState("");
const navigate = useNavigate();
const handleRangeSelect = (range: { from: Date; to?: Date } | undefined) => {
  if (!range?.from || !range?.to) {
    setSelectedRange(range);
    return;
  }

  const day = new Date(range.from);
  const end = new Date(range.to);
  let conflict = false;

  while (day <= end) {
    for (const unavailable of unavailableRanges) {
      const unStart = new Date(unavailable.start);
      const unEnd = new Date(new Date(unavailable.end).setDate(new Date(unavailable.end).getDate() + 1));
      if (day >= unStart && day < unEnd) {
        conflict = true;
        break;
      }
    }
    if (conflict) break;
    day.setDate(day.getDate() + 1);
  }

  if (!conflict) {
    setSelectedRange(range);
  } else {
    alert("That range includes unavailable dates. Please choose a different range.");
  }
};

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
      console.log(item.unavailable_dates);
      setListing(transformed);
      setUnavailableRanges(item.unavailable_dates || []);
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
          <div className="space-y-6 h-[642px]">
            {/* Price & Booking */}
            <Card className="sticky top-6 h-[642px]">
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
                    mode="range"
                    selected={selectedRange}
                    onSelect={handleRangeSelect}
                    numberOfMonths={2}
                    showOutsideDays={false}
                    disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) return true;
                        for (const range of unavailableRanges) {
                        const start = new Date(range.start);
                        const end = new Date(new Date(range.end).setDate(new Date(range.end).getDate() + 1));
                        if (date >= start && date <= end) return true;
                        }
                        return false;
                    }}
                    modifiers={{
                        future: (date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date >= today;
                        },
                        past: (date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                        },
                        unavailable: (date) => {
                        for (const range of unavailableRanges) {
                            const start = new Date(range.start);
                            const end = new Date(new Date(range.end).setDate(new Date(range.end).getDate() + 1));
                            if (date >= start && date <= end) return true;
                        }
                        return false;
                        },
                    }}
                    modifiersClassNames={{
                        range_start: "bg-blue-600 text-white",
                        range_end: "bg-blue-600 text-white",
                        range_middle: "bg-blue-200 text-blue-900",
                        unavailable: "bg-gray-100 text-gray-400 line-through",
                        selected: "bg-blue-500 text-white",
                    }}
                    />
                </div>

                {selectedRange?.from && (
                <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                    Selected:{' '}
                    {selectedRange.to
                        ? `${selectedRange.from.toLocaleDateString()} to ${selectedRange.to.toLocaleDateString()}`
                        : selectedRange.from.toLocaleDateString()}
                    </p>
                </div>
                )}

                <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedRange?.from || !selectedRange?.to}
                onClick={() => setShowModal(true)}
                >
                {selectedRange?.from
                    ? selectedRange.to
                    ? 'Reserve Now'
                    : 'Select an end date to reserve'
                    : 'Select a date range to reserve'}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>Free cancellation up to 24 hours before pickup</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Reservation</h2>
            
            <p className="text-sm text-gray-700 mb-2">
                You’re booking <strong>{listing.title}</strong> from{" "}
                <strong>{selectedRange?.from.toLocaleDateString()}</strong> to{" "}
                <strong>{selectedRange?.to?.toLocaleDateString()}</strong>.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                Message to the owner:
            </label>
            <textarea
                className="w-full border border-gray-300 rounded p-2 text-sm"
                rows={4}
                placeholder="Add a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <div className="mt-6 flex justify-end space-x-3">
                <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                >
                Cancel
                </Button>
                <Button
                    onClick={async () => {
                    try {
                        const res = await fetch("http://127.0.0.1:8000/requests", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            item: listing.id,
                            user: 1, // Replace with actual user ID
                            start_date: selectedRange.from.toISOString().split("T")[0],
                            end_date: selectedRange.to.toISOString().split("T")[0],
                            message: message,
                        }),
                        });

                        if (!res.ok) throw new Error("Failed to reserve");

                        toast.success("Reservation submitted!");
                        setShowModal(false);
                        setTimeout(() => navigate("/"), 1000); // short delay for toast display
                    } catch (err) {
                        console.error(err);
                        toast.error("Something went wrong.");
                    }
                    }}
                >
                Confirm Reservation
                </Button>
            </div>
            </div>
        </div>
        )}

    </div>
  );
};

export default ListingPage;