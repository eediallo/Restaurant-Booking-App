import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

interface BookingSuccessProps {
  bookingReference: string;
  visitDate: string;
  visitTime: string;
  partySize: number;
  onStartOver: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({
  bookingReference,
  visitDate,
  visitTime,
  partySize,
  onStartOver,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Booking Confirmed! 🎉
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Your reservation has been successfully confirmed. We look forward to
        serving you!
      </p>

      {/* Booking Reference */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Booking Reference
        </h3>
        <div className="text-2xl font-mono font-bold text-green-900 tracking-wider">
          {bookingReference}
        </div>
        <p className="text-sm text-green-700 mt-2">
          Please save this reference number for your records
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reservation Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">Date</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatDate(visitDate)}
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">Time</div>
            <div className="text-lg font-semibold text-gray-900">
              {visitTime}
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Party Size
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {partySize} {partySize === 1 ? "person" : "people"}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          What's Next?
        </h3>
        <div className="text-left space-y-2">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-blue-800">
              You'll receive a confirmation email shortly with all the details
            </span>
          </div>
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-blue-800">
              Please arrive within 15 minutes of your reservation time
            </span>
          </div>
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="text-blue-800">
              Contact us if you need to modify or cancel your reservation
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/my-bookings">
          <Button variant="outline" className="w-full sm:w-auto">
            View My Bookings
          </Button>
        </Link>
        <Button onClick={onStartOver} className="w-full sm:w-auto">
          Make Another Booking
        </Button>
      </div>

      {/* Contact Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          Need help? Contact TheHungryUnicorn
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-blue-600">
          <a href="tel:+1234567890" className="hover:text-blue-800">
            📞 (123) 456-7890
          </a>
          <a
            href="mailto:reservations@thehungryunicorn.com"
            className="hover:text-blue-800"
          >
            ✉️ reservations@thehungryunicorn.com
          </a>
        </div>
      </div>
    </div>
  );
};
