import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Restaurant Booking
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Book your table at the finest restaurants with ease. Discover amazing
          dining experiences and make reservations in just a few clicks.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Easy Booking
            </h3>
            <p className="text-gray-600">
              Simple and intuitive booking process. Find available slots and
              reserve your table instantly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Real-time Availability
            </h3>
            <p className="text-gray-600">
              See real-time availability and choose the perfect time for your
              dining experience.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Bookings
            </h3>
            <p className="text-gray-600">
              View, modify, or cancel your reservations anytime through your
              personal dashboard.
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          {isAuthenticated ? (
            <Link
              to="/booking"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium inline-block"
            >
              Make a Reservation
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-md text-lg font-medium inline-block"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
