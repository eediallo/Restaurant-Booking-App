import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <a href="/">TheHungryUnicorn</a>
        </div>

        <div className="navbar-menu">
          {user ? (
            // Authenticated user menu
            <>
              <a href="/dashboard" className="nav-link">
                Dashboard
              </a>
              <a href="/availability" className="nav-link">
                Find Tables
              </a>
              <a href="/book" className="nav-link">
                Make Booking
              </a>

              <div className="user-dropdown">
                <button className="user-button" onClick={toggleDropdown}>
                  <span className="user-name">{user.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <a href="/profile" className="dropdown-item">
                      Profile
                    </a>
                    <a href="/dashboard" className="dropdown-item">
                      My Bookings
                    </a>
                    <hr className="dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-btn"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Guest user menu
            <>
              <a href="/login" className="nav-link">
                Sign In
              </a>
              <a href="/register" className="nav-link register-btn">
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
