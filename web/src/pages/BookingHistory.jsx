import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./BookingHistory.css";

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    restaurant: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "date_desc", // date_desc, date_asc, restaurant, status
  });

  const [statusOptions] = useState([
    { value: "", label: "All Statuses" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
    { value: "no_show", label: "No Show" },
  ]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/user/bookings");
      setBookings(response.data || []);
    } catch (err) {
      setError("Failed to load booking history");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    // Search filter (booking reference, restaurant name, customer name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.booking_reference.toLowerCase().includes(searchLower) ||
          booking.restaurant_name.toLowerCase().includes(searchLower) ||
          `${booking.customer?.first_name} ${booking.customer?.surname}`
            .toLowerCase()
            .includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        (booking) => booking.status === filters.status
      );
    }

    // Restaurant filter
    if (filters.restaurant) {
      filtered = filtered.filter(
        (booking) => booking.restaurant_name === filters.restaurant
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (booking) => new Date(booking.visit_date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (booking) => new Date(booking.visit_date) <= new Date(filters.dateTo)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_asc":
          return new Date(a.visit_date) - new Date(b.visit_date);
        case "date_desc":
          return new Date(b.visit_date) - new Date(a.visit_date);
        case "restaurant":
          return a.restaurant_name.localeCompare(b.restaurant_name);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.visit_date) - new Date(a.visit_date);
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      restaurant: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "date_desc",
    });
  };

  const getUniqueRestaurants = () => {
    const restaurants = [...new Set(bookings.map((b) => b.restaurant_name))];
    return restaurants.sort();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      case "completed":
        return "status-completed";
      case "no_show":
        return "status-no-show";
      default:
        return "status-default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleBookingClick = (booking) => {
    navigate(`/booking/${booking.booking_reference}`);
  };

  const exportBookings = () => {
    const csvData = filteredBookings.map((booking) => ({
      "Booking Reference": booking.booking_reference,
      Restaurant: booking.restaurant_name,
      Date: booking.visit_date,
      Time: booking.visit_time,
      "Party Size": booking.party_size,
      Status: booking.status,
      Customer: `${booking.customer?.first_name} ${booking.customer?.surname}`,
      Email: booking.customer?.email,
      Phone: booking.customer?.mobile,
      "Special Requests": booking.special_requests || "",
      Created: booking.created_at,
    }));

    const csvString = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val || ""}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-history-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="booking-history">
        <div className="loading">Loading booking history...</div>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <div className="history-header">
        <h1>Booking History</h1>
        <p>Manage and view all your restaurant bookings</p>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Booking ref, restaurant, or customer..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Restaurant</label>
            <select
              value={filters.restaurant}
              onChange={(e) => handleFilterChange("restaurant", e.target.value)}
            >
              <option value="">All Restaurants</option>
              {getUniqueRestaurants().map((restaurant) => (
                <option key={restaurant} value={restaurant}>
                  {restaurant}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="restaurant">Restaurant A-Z</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
            <button
              className="export-btn"
              onClick={exportBookings}
              disabled={filteredBookings.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Bookings List */}
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>Try adjusting your filters or make a new booking.</p>
            <button
              className="action-btn primary"
              onClick={() => navigate("/restaurants")}
            >
              Find Restaurants
            </button>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.booking_reference}
              className="booking-card"
              onClick={() => handleBookingClick(booking)}
            >
              <div className="booking-main">
                <div className="booking-info">
                  <div className="booking-header">
                    <h3>{booking.restaurant_name}</h3>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div className="detail-item">
                      <span className="label">Reference:</span>
                      <span className="value">{booking.booking_reference}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date & Time:</span>
                      <span className="value">
                        {formatDate(booking.visit_date)} at{" "}
                        {formatTime(booking.visit_time)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Party Size:</span>
                      <span className="value">{booking.party_size} guests</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Customer:</span>
                      <span className="value">
                        {booking.customer?.first_name}{" "}
                        {booking.customer?.surname}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button
                    className="action-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookingClick(booking);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {booking.special_requests && (
                <div className="special-requests">
                  <span className="label">Special Requests:</span>
                  <span className="value">{booking.special_requests}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
