import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserWelcome } from "../components/auth/UserWelcome";
import { PageLayout } from "../components/layout/PageLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <PageLayout showBreadcrumbs={false}>
      {/* User Welcome for authenticated users */}
      {isAuthenticated && <UserWelcome />}

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {isAuthenticated
            ? "Ready for Your Next Dining Experience?"
            : "Welcome to Restaurant Booking"}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {isAuthenticated
            ? "Discover new flavors and book your table at the finest restaurants with ease."
            : "Book your table at the finest restaurants with ease. Discover amazing dining experiences and make reservations in just a few clicks."}
        </p>

        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <svg
              className="h-8 w-8 text-blue-600"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Easy Booking
          </h3>
          <p className="text-gray-600">
            Simple and intuitive booking process. Find available slots and
            reserve your table instantly.
          </p>
        </Card>

        <Card className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
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
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Real-time Availability
          </h3>
          <p className="text-gray-600">
            See real-time availability and choose the perfect time for your
            dining experience.
          </p>
        </Card>

        <Card className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
            <svg
              className="h-8 w-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Manage Bookings
          </h3>
          <p className="text-gray-600">
            View, modify, or cancel your reservations anytime through your
            personal dashboard.
          </p>
        </Card>
      </div>

      {/* Call to Action */}
      {isAuthenticated && (
        <div className="text-center">
          <Card variant="elevated" className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Book Your Next Table?
            </h2>
            <p className="text-gray-600 mb-6">
              Find the perfect restaurant and time for your dining experience.
            </p>
            <Link to="/booking">
              <Button variant="primary" size="lg">
                Make a Reservation
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};
