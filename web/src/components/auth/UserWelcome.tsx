import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserBookings } from "../../hooks/useBookingApi";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const UserWelcome: React.FC = () => {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useUserBookings(1, 10);

  if (!user) return null;

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const upcomingBookings =
    bookingsData?.bookings?.filter((booking) => {
      const bookingDate = new Date(
        `${booking.visit_date}T${booking.visit_time}`
      );
      return bookingDate > new Date() && booking.status !== "cancelled";
    }) || [];

  const totalBookings = bookingsData?.total || 0;

  return (
    <Card variant="elevated" className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">
            {getTimeBasedGreeting()},{" "}
            {user.first_name || user.email.split("@")[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back to your dining dashboard
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link to="/booking">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Make New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? "..." : upcomingBookings.length}
            </div>
            <div className="text-sm text-blue-800 font-medium">
              Upcoming Bookings
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "..." : totalBookings}
            </div>
            <div className="text-sm text-green-800 font-medium">
              Total Bookings
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg sm:col-span-2 lg:col-span-1">
            <div className="text-2xl font-bold text-purple-600">1+</div>
            <div className="text-sm text-purple-800 font-medium">
              Months as Member
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/my-bookings">
            <Button variant="outline" size="sm">
              View My Bookings
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              Update Profile
            </Button>
          </Link>
          {upcomingBookings.length > 0 && (
            <Link to={`/booking/${upcomingBookings[0].booking_reference}`}>
              <Button variant="outline" size="sm">
                Manage Next Booking
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {upcomingBookings.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Next Booking
          </h3>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {new Date(upcomingBookings[0].visit_date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
              <p className="text-sm text-gray-500">
                {upcomingBookings[0].visit_time} •{" "}
                {upcomingBookings[0].party_size} guests
              </p>
            </div>
            <Link to={`/booking/${upcomingBookings[0].booking_reference}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};
