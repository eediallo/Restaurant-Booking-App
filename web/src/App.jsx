import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookingSearch from "./pages/BookingSearch";
import BookingForm from "./pages/BookingForm";
import BookingDetails from "./pages/BookingDetails";
import BookingHistory from "./pages/BookingHistory";
import ReviewForm from "./pages/ReviewForm";
import UserProfile from "./pages/UserProfile";
import BookingTemplates from "./components/BookingTemplates";
import RestaurantSearch from "./pages/RestaurantSearch";
import RestaurantDetails from "./pages/RestaurantDetails";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/availability"
              element={
                <ProtectedRoute>
                  <BookingSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/availability/:restaurantName"
              element={
                <ProtectedRoute>
                  <BookingSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book"
              element={
                <ProtectedRoute>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/:bookingReference"
              element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              }
            />

            {/* Phase 4A - Advanced Booking Management */}
            <Route
              path="/booking-history"
              element={
                <ProtectedRoute>
                  <BookingHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:bookingReference"
              element={
                <ProtectedRoute>
                  <ReviewForm />
                </ProtectedRoute>
              }
            />

            {/* Restaurant Discovery Routes - Phase 3B */}
            <Route
              path="/restaurants"
              element={
                <ProtectedRoute>
                  <RestaurantSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant/:restaurantName"
              element={
                <ProtectedRoute>
                  <RestaurantDetails />
                </ProtectedRoute>
              }
            />

            {/* Protected routes - will be added as we build more features */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <BookingTemplates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <div>My Bookings - Coming Soon</div>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route
              path="*"
              element={
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/">Go back home</a>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
