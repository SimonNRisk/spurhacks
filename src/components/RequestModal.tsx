import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export type BookingRequest = {
  id: number;
  image: string;
  title: string;
  user: string;
  start_date: string;
  end_date: string;
  message: string;
};

type RequestModalProps = {
  request: BookingRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (id: number, action: "approved" | "rejected") => void;
};

function getDatesInRange(start: Date, end: Date): Date[] {
  const date = new Date(start);
  const dates: Date[] = [];
  while (date <= end) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export function RequestModal({ request, isOpen, onClose }: RequestModalProps) {
  if (!isOpen || !request) return null;

  const [showCalendar, setShowCalendar] = useState(false);

  const email = useMemo(() => {
    const [first, last] = request.user.toLowerCase().split(" ");
    return `${first}.${last}@queensu.ca`;
  }, [request.user]);

  const mockRating = useMemo(() => Math.floor(Math.random() * 6), []);

  const startDate = new Date("2025-06-20");
  const endDate = new Date("2025-06-24");

  const highlightedDates = useMemo(
    () => getDatesInRange(startDate, endDate),
    [startDate, endDate]
  );

  const handleAction = (action: "approved" | "rejected") => {
    toast.success(`Request ${action}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[28rem] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-primary mb-1">
          {request.title}
        </h2>
        <p className="text-gray-700 mb-1 font-medium">{request.user}</p>
        <p className="text-gray-600 mb-1 text-sm">{email}</p>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < mockRating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">Trust Score</span>
        </div>

        <p className="text-gray-600 italic mb-4">"{request.message}"</p>

        <div className="mb-4">
          <label className="text-sm text-gray-500 block mb-1">
            Booking Dates
          </label>
          <p className="text-sm text-gray-700 font-medium mb-2">
            {startDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}{" "}
            –{" "}
            {endDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-sm bg-primary text-white rounded-md p-2"
          >
            {showCalendar ? "Hide Calendar" : "View Calendar"}
          </button>

          {showCalendar && (
            <DayPicker
              mode="multiple"
              selected={highlightedDates}
              modifiers={{ booked: highlightedDates }}
              modifiersStyles={{
                booked: {
                  backgroundColor: "rgba(212, 242, 247, 0.6)",
                  color: "#176B82",
                  borderRadius: "0.375rem",
                  fontWeight: "500",
                },
              }}
              className="border rounded-lg p-2 mt-2"
            />
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleAction("rejected")}
            className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            Reject
          </button>
          <button
            onClick={() => handleAction("approved")}
            className="px-4 py-2 bg-white text-primary border-2 border-primary rounded hover:bg-primary-light"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
