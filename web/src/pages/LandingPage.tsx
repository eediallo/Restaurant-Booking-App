import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import "./LandingPage.css";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookNow = () => {
    if (user) {
      // Navigate to booking page
      navigate("/availability");
    } else {
      // Navigate to login page
      navigate("/login");
    }
  };

  return (
    <div className="landing-page">
      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          <div className="booking-section">
            <h1 className="main-title">Book a Table</h1>
            <p className="subtitle">
              Discover amazing restaurants and reserve your dining experience in
              advance.
            </p>
            <div className="action-buttons">
              <Button
                variant="primary"
                size="lg"
                className="book-button"
                onClick={handleBookNow}
              >
                {user ? "Book Now" : "Sign in to Book"}
              </Button>
              {user && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="explore-button"
                  onClick={() => navigate("/restaurants")}
                >
                  Explore Restaurants
                </Button>
              )}
            </div>
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
