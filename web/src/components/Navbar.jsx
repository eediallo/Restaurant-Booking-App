import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <a href="/">TheHungryUnicorn</a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {user ? (
            // Authenticated user menu
            <>
              <a
                href="/dashboard"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Dashboard
              </a>
              <a
                href="/restaurants"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Restaurants
              </a>
              <a
                href="/availability"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Find Tables
              </a>
              <a href="/book" className="nav-link" onClick={closeMobileMenu}>
                Make Booking
              </a>
              <a
                href="/templates"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Quick Book
              </a>

              <div className="user-dropdown">
                <button className="user-button" onClick={toggleDropdown}>
                  <span className="user-name">{user.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <a
                      href="/profile"
                      className="dropdown-item"
                      onClick={closeMobileMenu}
                    >
                      Profile
                    </a>
                    <a
                      href="/dashboard"
                      className="dropdown-item"
                      onClick={closeMobileMenu}
                    >
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
              <a href="/login" className="nav-link" onClick={closeMobileMenu}>
                Sign In
              </a>
              <a
                href="/register"
                className="nav-link register-btn"
                onClick={closeMobileMenu}
              >
                Sign Up
              </a>
            </>
          )}
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
