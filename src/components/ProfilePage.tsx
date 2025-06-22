import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  Star,
  User,
} from "lucide-react";
import Header from "./Header";
import { BookingRequest, RequestModal } from "./RequestModal";

// Mock data with more detailed information
const mockProfileData = {
  userId: 1,
  name: "Jane Doe",
  //   avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  //   stats: {
  //     listedItems: 12,
  //     upcomingRentals: 3,
  //     pastRentals: 24,
  //     earnings: 2847.50,
  //     spending: 892.25,
  //     rating: 4.8,
  //     totalViews: 1247
  //   },
  upcomingRentals: [
    {
      id: 1,
      item: "Professional Camera Kit",
      renter: "Mike Johnson",
      date: "2025-06-25",
      duration: "3 days",
      price: 180,
      status: "confirmed",
    },
    {
      id: 2,
      item: "Camping Tent Set",
      renter: "Sarah Wilson",
      date: "2025-06-28",
      duration: "1 week",
      price: 95,
      status: "pending",
    },
    {
      id: 3,
      item: "Power Drill",
      renter: "Tom Brown",
      date: "2025-07-02",
      duration: "2 days",
      price: 45,
      status: "confirmed",
    },
  ],
  pastRentals: [
    {
      id: 4,
      item: "Mountain Bike",
      owner: "Alex Chen",
      date: "2025-06-15",
      duration: "2 days",
      price: 75,
      rating: 5,
    },
    {
      id: 5,
      item: "Projector",
      owner: "Lisa Park",
      date: "2025-06-10",
      duration: "1 day",
      price: 60,
      rating: 4,
    },
    {
      id: 6,
      item: "Pressure Washer",
      owner: "David Lee",
      date: "2025-06-05",
      duration: "3 days",
      price: 120,
      rating: 5,
    },
    {
      id: 7,
      item: "Wedding Dress",
      owner: "Emma Smith",
      date: "2025-05-28",
      duration: "1 day",
      price: 200,
      rating: 5,
    },
  ],
  listedItems: [
    {
      id: 1,
      name: "Professional Camera Kit",
      category: "Electronics",
      price: 60,
      views: 245,
      bookings: 8,
      status: "active",
    },
    {
      id: 2,
      name: "Camping Tent Set",
      category: "Outdoor",
      price: 25,
      views: 189,
      bookings: 12,
      status: "active",
    },
    {
      id: 3,
      name: "Power Drill",
      category: "Tools",
      price: 15,
      views: 156,
      bookings: 6,
      status: "active",
    },
    {
      id: 4,
      name: "Party Speakers",
      category: "Electronics",
      price: 40,
      views: 298,
      bookings: 15,
      status: "active",
    },
    {
      id: 5,
      name: "Yoga Mats (5x)",
      category: "Fitness",
      price: 20,
      views: 98,
      bookings: 4,
      status: "inactive",
    },
  ],
  pendingRequests: [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1519181245277-cffeb31da2b4?w=100&h=100&fit=crop",
      title: "Professional Camera Kit",
      user: "Emily Davis",
      startDate: "2025-06-20",
      endDate: "2025-06-23",
      message: "Hi, I would love to use this for my project.",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=100&h=100&fit=crop",
      title: "Camping Tent Set",
      user: "Jason Lee",
      startDate: "2025-06-30",
      endDate: "2025-07-05",
      message: "Planning a weekend camping trip.",
    },
  ],
};

const AnimatedCounter = ({
  value,
  duration = 800,
  prefix = "",
  suffix = "",
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
  prefix = "",
  suffix = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card
      className={`relative transition-all duration-700 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } hover:scale-105 hover:shadow-lg cursor-pointer border-l-4`}
      style={{ borderLeftColor: color }}
    >
      <CardContent className="p-6">
        <div className="absolute top-3 right-3">
          <div
            className={`p-2 rounded-full`}
            style={{ backgroundColor: color + "20" }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        <div className="pr-12">
          <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
          <p className="text-3xl font-bold" style={{ color }}>
            {isVisible ? (
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            ) : (
              "0"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const RentalCard = ({ rental, type = "upcoming" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="p-1">
      {" "}
      {/* Container with padding for ring space */}
      <Card
        className={`transition-all duration-300 transform hover:scale-102 hover:shadow-md cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-800 text-sm">
              {rental.item}
            </h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                type === "upcoming"
                  ? rental.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {rental.status}
            </span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {rental.start_date} to {rental.end_date}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{rental.renter}</span>
              <span className="font-bold text-green-600">${rental.price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ItemCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="p-1">
      {" "}
      {/* Container with padding for ring space */}
      <Card
        className={`transition-all duration-300 transform hover:scale-102 hover:shadow-md cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">
                {item.name}
              </h4>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === "Confirmed"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>${item.price}/day</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{item.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>{item.bookings}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PendingRequestCard = ({
  request,
  onClick,
}: {
  request: BookingRequest;
  onClick: (req: BookingRequest) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="p-1 w-full" onClick={() => onClick(request)}>
      <Card
        className={`transition-all duration-300 transform hover:scale-102 hover:shadow-md cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <img
            src={request.image}
            alt={request.title}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-md">
              {request.title}
            </h4>
            <p className="text-xs text-gray-600">
              Requested by <strong>{request.user}</strong>
            </p>
            <p className="text-xs text-gray-600">
              {request.start_date} to {request.end_date}
            </p>
            <p className="mt-2 text-sm text-gray-700 italic">
              "{request.message}"
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <button className="px-3 py-1 bg-white text-primary border-2 border-primary rounded-md hover:bg-primary-light text-sm">
              Approve
            </button>
            <button className="px-3 py-1 bg-white text-red-500 border border-red-500 rounded-md hover:bg-red-100 text-sm">
              Reject
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const YourRequestCard = ({ request }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="p-1 w-full">
      <Card
        className={`transition-all duration-300 transform hover:scale-102 hover:shadow-md cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <img
            src={request.image}
            alt={request.title}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-md">
              {request.title}
            </h4>
            {/* <p className="text-xs text-gray-600">Requested by <strong>{request.user}</strong></p> */}
            <p className="text-xs text-gray-600">
              {request.start_date} to {request.end_date}
            </p>
            <p className="mt-2 text-sm text-gray-700 italic">
              "{request.message}"
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            {/* <button className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">Approve</button> */}
            <button className="px-3 py-1 bg-white text-red-500 border-2 border-red-500 rounded-md hover:bg-red-100 text-sm">
              Remove
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (request: BookingRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/profile/")
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        const transformed = {
          name: data.name,
          upcomingRentals: data.upcoming_rentals || [],
          pastRentals: data.past_rentals || [],
          listedItems: data.listed_items || [],
          pendingRequests: data.pending_requests || [],
          yourRequests: data.your_requests || [],
        };
        console.log("Fetched profile:", transformed);
        setProfile(transformed);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      });
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!profile)
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center p-4 h-full">
          <div className="flex flex-col items-center space-y-6">
            {/* Enhanced spinning loader */}
            <div className="relative">
              {/* Outer ring */}
              <div className="w-16 h-16 border-4 border-primary rounded-full animate-pulse"></div>

              {/* Spinning ring */}
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin"></div>
            </div>

            {/* Text with animated dots */}
            <div className="text-center space-y-2">
              <p className="text-xl font-medium text-slate-700">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );

  const {
    name,
    upcomingRentals,
    pastRentals,
    listedItems,
    pendingRequests,
    yourRequests,
  } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <User className="h-16 w-16 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, {name}!
              </h1>
              <p className="text-gray-600">
                Here's your rental dashboard overview
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Pending Requests Section */}
        <div
          className={`w-full mb-8 transition-all duration-1000 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Pending Requests
              </h2>
              {pendingRequests.length > 0 ? (
                <div className="flex flex-col gap-4 max-h-[270px] overflow-y-auto">
                  {pendingRequests.map((req) => (
                    <PendingRequestCard
                      key={req.id}
                      request={req}
                      onClick={handleOpenModal}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No pending requests
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User's Requests Section */}
        <div
          className={`w-full mb-8 transition-all duration-1000 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your Requests
              </h2>
              {yourRequests.length > 0 ? (
                <div className="flex flex-col gap-4 max-h-[270px] overflow-y-auto">
                  {yourRequests.map((req) => (
                    <YourRequestCard key={req.id} request={req} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No pending requests
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rentals and Listings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rentals Section */}
          <div
            className={`transition-all duration-1000 transform ${
              isLoaded
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0"
            }`}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 min-h-[56px]">
                  <h2 className="text-xl font-bold text-gray-800">
                    Your Rentals
                  </h2>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab("upcoming")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === "upcoming"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600"
                      }`}
                    >
                      Upcoming ({upcomingRentals.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("past")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === "past"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600"
                      }`}
                    >
                      Past ({pastRentals.length})
                    </button>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activeTab === "upcoming" ? (
                    upcomingRentals.length > 0 ? (
                      upcomingRentals.map((rental) => (
                        <RentalCard
                          key={rental.id}
                          rental={rental}
                          type="upcoming"
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No upcoming rentals
                      </p>
                    )
                  ) : pastRentals.length > 0 ? (
                    pastRentals.map((rental) => (
                      <RentalCard key={rental.id} rental={rental} type="past" />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No past rentals
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listed Items Section */}
          <div
            className={`transition-all duration-1000 transform ${
              isLoaded
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 min-h-[56px]">
                  <h2 className="text-xl font-bold text-gray-800">
                    Your Listings
                  </h2>
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {
                      listedItems.filter((item) => item.status === "active")
                        .length
                    }{" "}
                    Active
                  </span>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {listedItems.length > 0 ? (
                    listedItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No items listed
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <RequestModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProfilePage;
