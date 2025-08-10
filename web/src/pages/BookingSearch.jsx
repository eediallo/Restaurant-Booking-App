import React, { useState } from "react";
import { api } from "../services/api";
import "./BookingSearch.css";

const BookingSearch = () => {
  const [searchParams, setSearchParams] = useState({
    visitDate: "",
    visitTime: "",
    partySize: 2,
    channelCode: "ONLINE",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const formData = new FormData();
      formData.append("VisitDate", searchParams.visitDate);
      formData.append("PartySize", searchParams.partySize);
      formData.append("ChannelCode", searchParams.channelCode);

      const response = await api.post(
        "/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/AvailabilitySearch",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAvailableSlots(response.data.AvailableSlots || []);
    } catch (err) {
      setError("Failed to search availability. Please try again.");
      console.error("Error searching availability:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slot) => {
    // Navigate to booking form with pre-filled data
    const bookingData = {
      visitDate: searchParams.visitDate,
      visitTime: slot.time,
      partySize: searchParams.partySize,
      channelCode: searchParams.channelCode,
    };

    // Store booking data in localStorage for the booking form
    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    window.location.href = "/book";
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="booking-search">
      <div className="search-header">
        <h1>Find Available Tables</h1>
        <p>Search for available dining times at TheHungryUnicorn</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="visitDate">Visit Date</label>
          <input
            type="date"
            id="visitDate"
            name="visitDate"
            value={searchParams.visitDate}
            onChange={handleInputChange}
            min={today}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="partySize">Party Size</label>
          <select
            id="partySize"
            name="partySize"
            value={searchParams.partySize}
            onChange={handleInputChange}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
              <option key={size} value={size}>
                {size} {size === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? "Searching..." : "Search Availability"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searched && !loading && (
        <div className="search-results">
          <h2>
            Available Times for{" "}
            {searchParams.visitDate
              ? formatDate(searchParams.visitDate)
              : "Selected Date"}
          </h2>

          {availableSlots.length === 0 ? (
            <div className="no-availability">
              <h3>No availability found</h3>
              <p>Try selecting a different date or party size.</p>
            </div>
          ) : (
            <div className="slots-grid">
              {availableSlots.map((slot, index) => (
                <div key={index} className="time-slot">
                  <div className="slot-time">{formatTime(slot.time)}</div>
                  <div className="slot-info">
                    <span className="available-count">
                      {slot.available_tables} tables available
                    </span>
                  </div>
                  <button
                    className="book-slot-btn"
                    onClick={() => handleBookSlot(slot)}
                    disabled={slot.available_tables === 0}
                  >
                    {slot.available_tables > 0
                      ? "Book This Time"
                      : "Unavailable"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSearch;
