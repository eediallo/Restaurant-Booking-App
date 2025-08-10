import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import "./LandingPage.css";

export function LandingPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleBookNow = () => {
    if (isAuthenticated()) {
      // Navigate to booking page (will be implemented later)
      navigate("/bookings");
    } else {
      // Navigate to login page
      navigate("/login");
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-main">TheHungry</span>
          <span className="logo-accent">Unicorn</span>
        </div>
        <div className="auth-buttons">
          {isAuthenticated() ? (
            <>
              <span className="welcome-text">
                Welcome, {user?.username || user?.first_name || "User"}!
              </span>
              <Link to="/bookings">
                <Button variant="ghost" size="sm">
                  My Bookings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          <div className="booking-section">
            <h1 className="main-title">Book a Table</h1>
            <p className="subtitle">
              Reserve your dining experience in advance.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="book-button"
              onClick={handleBookNow}
            >
              {isAuthenticated() ? "Book Now" : "Sign in to Book"}
            </Button>
          </div>

          <div className="illustration">
            <div className="restaurant-scene">
              {/* Simple restaurant table illustration */}
              <div className="table-grid">
                <div className="table-row">
                  <div className="table-item"></div>
                  <div className="table-item"></div>
                  <div className="table-item"></div>
                </div>
                <div className="table-row">
                  <div className="table-item"></div>
                  <div className="table-item selected"></div>
                  <div className="table-item"></div>
                </div>
                <div className="table-row">
                  <div className="table-item"></div>
                  <div className="table-item"></div>
                  <div className="table-item"></div>
                </div>
              </div>

              {/* Dining illustration */}
              <div className="dining-scene">
                <div className="person">
                  <div className="person-head"></div>
                  <div className="person-body"></div>
                </div>
                <div className="dining-table">
                  <div className="plate"></div>
                  <div className="glass"></div>
                </div>
                <div className="chair"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
